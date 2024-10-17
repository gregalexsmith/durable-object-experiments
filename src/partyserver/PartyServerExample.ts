import { Server, Connection } from 'partyserver';

export class PartyServerExample extends Server {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	onConnect(connection: Connection) {
		console.log('Connected', connection.id, 'to server', this.name);
	}

	onMessage(connection: Connection, message: string) {
		console.log('Message from', connection.id, ':', message);
		this.broadcast(message);
	}
}
