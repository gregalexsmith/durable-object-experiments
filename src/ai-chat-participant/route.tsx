import { Hono } from 'hono';
import type { Context } from '../types';
import { jsxRenderer } from 'hono/jsx-renderer';
import { AIChatParticipant } from './AIChatParticipant';
import { WebSocketHibernationServer } from '../websocket-hibernation/WebSocketHibernationServer';

const app = new Hono<Context>();

const EXAMPLE_WS_SERVER_DO_ID = 'default_example_ws_server';
const BASE_URL = '/ai-chat-participant';

app.get(
	'/*',
	jsxRenderer(async () => {
		return (
			<html>
				<head>
					<script src="/websocket-client.js"></script>
					<script src="/ai-chat-participant.js"></script>
				</head>
				<body>
					<a href="/">Home</a>
					<h1>WebSocket Hibernation</h1>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' }} id="ws-controls">
						<div style={{ display: 'flex', gap: '10px' }}>
							<button data-ws-connect>Connect</button>
							<button data-ws-close>Close</button>
						</div>
						<div data-ws-client-count></div>
						<div style={{ display: 'flex', gap: '10px' }}>
							<input data-ws-input />
							<button data-ws-send>Send</button>
						</div>
						<div data-ws-output></div>
					</div>

					<button type="button" data-add-ai-participant>
						Add AI Participant
					</button>
				</body>
			</html>
		);
	})
);

app.get('/', (c) => {
	return c.render('');
});

app.get('/websocket', (c) => {
	console.log('connecting websocket');
	const upgradeHeader = c.req.header('Upgrade');
	if (upgradeHeader !== 'websocket') {
		return c.text('Expected Upgrade: websocket', 426);
	}

	const id = c.env.WEBSOCKET_HIBERNATION_SERVER.idFromName(EXAMPLE_WS_SERVER_DO_ID);
	const stub = c.env.WEBSOCKET_HIBERNATION_SERVER.get(id);

	return stub.fetch(c.req.raw);
});

app.post('/add-ai-participant', async (c) => {
	// Create a new AI participant
	const aiParticipantId = c.env.AI_CHAT_PARTICIPANT.newUniqueId();
	const aiParticipant = c.env.AI_CHAT_PARTICIPANT.get(aiParticipantId);

	// Get the WebSocket server URL
	const wsServerUrl = new URL(c.req.url);
	wsServerUrl.pathname = 'ai-chat-participant/websocket';
	wsServerUrl.protocol = wsServerUrl.protocol.replace('http', 'ws');

	console.log('wsServerUrl', wsServerUrl.toString());

	// Connect the AI participant to the WebSocket server
	await aiParticipant.connectToServer(wsServerUrl.toString());

	console.log('aiParticipant', aiParticipant);

	return c.json({ success: true, aiParticipantId: aiParticipantId.toString() });
});

export default app;
