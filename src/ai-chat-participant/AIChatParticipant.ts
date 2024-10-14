import { DurableObject } from 'cloudflare:workers';
import OpenAI from 'openai';

export class AIChatParticipant extends DurableObject {
	private openai: OpenAI;
	private understanding: string = '';
	private wsServer: WebSocket | null = null;
	private participantId: string;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
			baseURL: `${env.CF_GATEWAY_BASE_URL}/openai`,
		});
		this.participantId = `AI-${Math.random().toString(36).substr(2, 9)}`;
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
			return;
		}

		// Update understanding
		this.understanding = await this.updateUnderstanding(message);
		console.log('--------------------------------');
		console.log('AI - understanding', this.understanding);

		// Generate and send response
		const response = await this.generateResponse();
		console.log('AI - send message', response);
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
			this.wsServer.send(message);
		}
	}
}
