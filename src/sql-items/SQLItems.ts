/**
 * References:
 * - https://developers.cloudflare.com/durable-objects/api/storage-api/#sqlexec
 * - https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/#sqlite-storage-backend
 */

import { DurableObject } from 'cloudflare:workers';

type Item = {
	id: number;
	content: string;
};

const sqlSchema = `
CREATE TABLE IF NOT EXISTS items(
  id    INTEGER PRIMARY KEY,
  content  TEXT
);
`;

export class SQLItems extends DurableObject {
	sql: SqlStorage;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.sql = ctx.storage.sql;
		this.sql.exec(sqlSchema);
	}

	getItems() {
		return this.sql.exec('SELECT * FROM items;').toArray() as Item[];
	}

	createItem(content: string) {
		this.sql.exec(`INSERT INTO items (content) VALUES ('${content}');`);
	}

	removeItem(id: number) {
		try {
			let cursor = this.sql.exec(`DELETE FROM items WHERE id = ?;`, id);
			const result = cursor.next();
			console.log('Item removed successfully', result);

			const items = this.sql.exec('SELECT * FROM items;').toArray() as Item[];
			console.log('Items after removal:', items);
			return { success: true };
		} catch (error) {
			console.error('Error removing item:', error);
			throw error;
		}
	}
}
