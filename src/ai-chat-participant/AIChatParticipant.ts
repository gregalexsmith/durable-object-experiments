import { DurableObject } from 'cloudflare:workers';
import OpenAI from 'openai';

type Message = {
	id: number;
	role: 'user' | 'assistant';
	content: string;
};

const sqlSchema = `
CREATE TABLE IF NOT EXISTS messages(
  id    INTEGER PRIMARY KEY,
  role  TEXT,
  content  TEXT
);
`;

export class AIChatParticipant extends DurableObject {
	private ai: Ai;
	private sql: SqlStorage;
	private openai: OpenAI;
	private understanding: string = '';
	private wsServer: WebSocket | null = null;
	private lastSentMessage: string = '';
	private participantId: string;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.ai = env.AI;
		this.sql = ctx.storage.sql;
		this.sql.exec(sqlSchema);
		this.openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
			baseURL: `${env.CF_GATEWAY_BASE_URL}/openai`,
		});
		this.participantId = `AI-${Math.random().toString(36).substr(2, 9)}`;
	}

	addMessage(message: Omit<Message, 'id'>) {
		const escapedRole = message.role.replace(/'/g, "''");
		const escapedContent = message.content.replace(/'/g, "''");
		this.sql.exec(`INSERT INTO messages (role, content) VALUES ('${escapedRole}', '${escapedContent}');`);
	}

	getMessages() {
		return this.sql.exec('SELECT * FROM messages;').toArray() as Message[];
	}

	clearMessages() {
		this.sql.exec('DELETE FROM messages;');
	}

	async connectToServer(serverUrl: string) {
		this.wsServer = new WebSocket(serverUrl);
		console.log('connected to server', this.wsServer, serverUrl);
		this.wsServer.addEventListener('message', (event) => this.handleMessage(event.data as string));
		this.wsServer.addEventListener('open', () => {
			// Send the AI's name (participantId) as the first message
			this.sendMessage(this.participantId);
		});
	}

	private async handleMessage(message: string) {
		// Ignore messages from self or system messages
		if (message.startsWith(this.participantId) || message.includes('has joined the chat') || message.includes('Total clients:')) {
			console.log('Ignoring message:', message);
			return;
		}

		// Update understanding
		this.understanding = await this.updateUnderstanding(message);

		// Generate and send response
		const response = await this.generateResponse();
		this.sendMessage(response);
	}

	private async updateUnderstanding(message: string): Promise<string> {
		const prompt = `Current understanding: ${this.understanding}\nNew message: ${message}\nUpdate the understanding of the conversation:`;
		const completion = await this.openai.chat.completions.create({
			model: 'gpt-4o-mini',
			max_tokens: 200,
			messages: [{ role: 'user', content: prompt }],
		});
		return completion.choices[0].message.content || '';
	}

	private async generateResponse(): Promise<string> {
		const prompt = `Based on the current understanding: ${this.understanding}\nGenerate a response:`;
		const completion = await this.openai.chat.completions.create({
			model: 'gpt-4o-mini',
			max_tokens: 100,
			messages: [{ role: 'user', content: prompt }],
		});
		return completion.choices[0].message.content || '';
	}

	private sendMessage(message: string) {
		if (this.wsServer && this.wsServer.readyState === WebSocket.OPEN) {
			const messageWithId = `${message} (${this.participantId})`;
			console.log('sending message', messageWithId);
			this.wsServer.send(messageWithId);
		}
	}
}
