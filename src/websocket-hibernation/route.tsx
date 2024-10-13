import { Hono } from 'hono';
import type { Context } from '../types';
import { upgradeWebSocket } from 'hono/cloudflare-workers';

const app = new Hono<Context>();

app.get('/', (c) => {
	return c.html(
		<html>
			<head>
				<script src="/websocket-hibernation.js"></script>
			</head>
			<body>
				<a href="/">Home</a>
				<h1>WebSocket Hibernation</h1>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} id="ws-controls">
					<button id="connect">Connect</button>
					<button id="send">Send</button>
					<button id="close">Close</button>
					<div id="output"></div>
				</div>
			</body>
		</html>
	);
});

app.get('/websocket', (c) => {
	const upgradeHeader = c.req.header('Upgrade');
	if (upgradeHeader !== 'websocket') {
		return c.text('Expected Upgrade: websocket', 426);
	}

	const id = c.env.WEBSOCKET_HIBERNATION_SERVER.idFromName('foo');
	const stub = c.env.WEBSOCKET_HIBERNATION_SERVER.get(id);

	return stub.fetch(c.req.raw);
});

export default app;
