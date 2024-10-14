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
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		this.ctx.acceptWebSocket(server);

		const session = {
			name: null, // Name will be set on first message
		};
		server.serializeAttachment({ ...server.deserializeAttachment(), session });
		this.sessions.set(server, session);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async webSocketMessage(ws: WebSocket, message: string) {
		const session = this.sessions.get(ws);

		if (!session.name) {
			// First message, set the name
			session.name = message;
			ws.serializeAttachment({ ...ws.deserializeAttachment(), name: session.name });
			this.sessions.set(ws, { ...session, name: message });
			this.broadcast(`${session.name} has joined the chat`);
			this.broadcast(`Total clients: ${this.sessions.size}`);
		} else {
			// Regular message
			this.broadcast(`${session.name}: ${message}`);
		}
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
