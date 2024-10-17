import { Hono } from 'hono';
import type { Context } from '../types';
import { jsxRenderer } from 'hono/jsx-renderer';

const app = new Hono<Context>();

app.get(
	'/*',
	jsxRenderer(async () => {
		return (
			<html>
				<head>
					<script src="/websocket-client.js"></script>
				</head>
				<body>
					<a href="/">Home</a>
					<h1>PartyServer Example</h1>
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
				</body>
			</html>
		);
	})
);

app.get('/', (c) => {
	return c.render('');
});

app.get('/websocket*', (c) => {
	/**
	 * Simplified version of routePartykitRequest
	 * https://github.com/threepointone/partyserver/blob/261f22c5cc2d2ab520c60d3ddca500357143af3d/packages/partyserver/src/index.ts#L80
	 */
	const url = new URL(c.req.url);
	const parts = url.pathname.split('/');

	// Check if the URL path starts with the correct prefix and has enough parts
	// The expected format is /parties/[namespace]/[room]
	// const prefix = 'parties';
	// if (parts[1] !== prefix || parts.length < 4) {
	// 	return new Response('Not found', { status: 404 });
	// }

	const name = parts[3] || 'example_default_room';
	const doNamespace = 'PARTY_SERVER_EXAMPLE';
	const id = c.env[doNamespace].idFromName(name);
	const stub = c.env[doNamespace].get(id);

	const req = new Request(c.req.raw);
	req.headers.set('x-partykit-room', name);
	req.headers.set('x-partykit-namespace', doNamespace);

	return stub.fetch(req);
});

export default app;
