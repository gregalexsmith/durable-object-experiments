import { DurableObject } from 'cloudflare:workers';

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

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.ai = env.AI;
		this.sql = ctx.storage.sql;
		this.sql.exec(sqlSchema);
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
		// @ts-expect-error: beta model
		const response = (await this.ai.run('@cf/meta/llama-3.2-1b-instruct', {
			messages: [
				{
					role: 'user',
					content: prompt,
				},
			],
		})) as {
			response?: string;
			tool_calls?: {
				name: string;
				arguments: unknown;
			}[];
		};

		if (!response.response) {
			throw new Error('No response text');
		}

		this.addMessage({ role: 'assistant', content: response.response });

		return Response.json(response);
	}
}
