/**
 * References:
 * - https://developers.cloudflare.com/durable-objects/api/storage-api/#sqlexec
 * - https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#sqlite-storage-backend
 */

import { DurableObject } from 'cloudflare:workers';

type Task = {
	id: number;
	content: string;
};

const sqlSchema = `
CREATE TABLE IF NOT EXISTS tasks(
  id    INTEGER PRIMARY KEY,
  content  TEXT
);
`;

export class SQLBasic extends DurableObject {
	sql: SqlStorage;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.sql = ctx.storage.sql;
		this.sql.exec(sqlSchema);
	}

	getTasks() {
		return this.sql.exec('SELECT * FROM tasks;').toArray() as Task[];
	}

	createTask(content: string) {
		this.sql.exec(`INSERT INTO tasks (content) VALUES ('${content}');`);
	}

	removeTask(id: number) {
		try {
			let cursor = this.sql.exec(`DELETE FROM tasks WHERE id = ?;`, id);
			const result = cursor.next();
			console.log('Task removed successfully', result);

			const tasks = this.sql.exec('SELECT * FROM tasks;').toArray() as Task[];
			console.log('Tasks after removal:', tasks);
			return { success: true };
		} catch (error) {
			console.error('Error removing task:', error);
			throw error;
		}
	}
}
