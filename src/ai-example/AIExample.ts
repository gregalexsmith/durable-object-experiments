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

export class AIExample extends DurableObject {
	ai: Ai;
	sql: SqlStorage;
	openai: OpenAI;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.ai = env.AI;
		this.sql = ctx.storage.sql;
		this.sql.exec(sqlSchema);
		this.openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
			baseURL: `${env.CF_GATEWAY_BASE_URL}/openai`,
		});
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

	async generateText(prompt: string) {
		this.addMessage({ role: 'user', content: prompt });
		const completion = await this.openai.chat.completions.create({
			model: 'gpt-4o-mini',
			max_tokens: 100,
			messages: [{ role: 'user', content: prompt }],
		});

		if (!completion.choices[0].message.content) {
			throw new Error('No response text');
		}

		this.addMessage({ role: 'assistant', content: completion.choices[0].message.content });

		return completion.choices[0].message.content;
	}

	async streamText(prompt: string) {
		this.addMessage({ role: 'user', content: prompt });

		const aiStream = await this.openai.chat.completions.create({
			model: 'gpt-4o-mini',
			max_tokens: 100,
			stream: true,
			messages: [{ role: 'user', content: prompt }],
		});

		let fullMessage = '';

		const encoder = new TextEncoder();

		const self = this;

		return new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of aiStream) {
						const content = chunk.choices[0]?.delta?.content || '';
						if (content) {
							fullMessage += content;
							controller.enqueue(encoder.encode(`${content}\n\n`));
						}
					}
				} catch (error) {
					console.error('Error processing stream:', error);
					controller.error(error);
				} finally {
					controller.close();
					self.addMessage({ role: 'assistant', content: fullMessage });
				}
			},
		});
	}
}
