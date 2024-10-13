/**
 * References:
 * - https://developers.cloudflare.com/durable-objects/examples/websocket-hibernation-server/
 * - https://github.com/cloudflare/workers-chat-demo/blob/master/src/chat.mjs
 */

import { DurableObject } from 'cloudflare:workers';

// Durable Object
export class WebSocketHibernationServer extends DurableObject {
	sessions!: Map<WebSocket, any>;

	constructor(state: DurableObjectState, env: any) {
		super(state, env);
		this.sessions = new Map();
		this.ctx.getWebSockets().forEach((ws) => {
			const meta = ws.deserializeAttachment();
			this.sessions.set(ws, meta);
		});
	}

	async fetch(request: Request) {
		// Creates two ends of a WebSocket connection.
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		// Calling `acceptWebSocket()` informs the runtime that this WebSocket is to begin terminating
		// request within the Durable Object. It has the effect of "accepting" the connection,
		// and allowing the WebSocket to send and receive messages.
		// Unlike `ws.accept()`, `state.acceptWebSocket(ws)` informs the Workers Runtime that the WebSocket
		// is "hibernatable", so the runtime does not need to pin this Durable Object to memory while
		// the connection is open. During periods of inactivity, the Durable Object can be evicted
		// from memory, but the WebSocket connection will remain open. If at some later point the
		// WebSocket receives a message, the runtime will recreate the Durable Object
		// (run the `constructor`) and deliver the message to the appropriate handler.
		this.ctx.acceptWebSocket(server);

		const session = {
			name: Math.random().toString(2).substring(2, 15),
		};
		server.serializeAttachment({ ...server.deserializeAttachment(), session });
		this.sessions.set(server, session);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async webSocketMessage(ws: WebSocket, message: string) {
		// Upon receiving a message from the client, reply with the same message,
		// but will prefix the message with "[Durable Object]: " and return the
		// total number of connections.
		console.log('ws server - message', message);
		// ws.send(`[Durable Object] message: ${message}, connections: ${this.clients.size}`);
		const session = this.sessions.get(ws);
		console.log('ws server - session', session);
		this.broadcast(`${session.name} says: ${message}`);
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
		// Remove the WebSocket from the sessions map
		this.sessions.delete(ws);

		// Log the closure details
		console.log(`WebSocket closed with code ${code}, reason: ${reason}, wasClean: ${wasClean}`);

		// If the code is not 1006 (abnormal closure), we can safely close the WebSocket
		if (code !== 1006) {
			ws.close(code, reason);
		}

		// Notify other clients about the disconnection
		const session = this.sessions.get(ws);
		if (session && session.name) {
			this.broadcast(`${session.name} has left the chat`);
		}
	}

	broadcast(message: string) {
		let quitters: { name: string }[] = [];
		this.sessions.forEach((session, webSocket) => {
			try {
				webSocket.send(message);
			} catch (err) {
				// Whoops, this connection is dead. Remove it from the map and arrange to notify
				// everyone below.
				session.quit = true;
				quitters.push(session);
				this.sessions.delete(webSocket);
			}
		});

		quitters.forEach((quitter) => {
			if (quitter.name) {
				this.broadcast(`${quitter.name} has left the chat`);
			}
		});
	}
}
