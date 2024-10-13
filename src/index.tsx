import { Hono } from 'hono';
import counterBasic from './counter-basic/route';
import simulation from './simulation/route';
import webSocketHibernation from './websocket-hibernation/route';
import sqlBasic from './sql-basic/route';
import type { Context } from './types';

const app = new Hono<Context>();

app.get('/', (c) => {
	return c.html(
		<html>
			<body>
				<h1>Durable Object Examples</h1>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<a href="/counter-basic">Counter Basic</a>
					<a href="/simulation">World Simulation</a>
					<a href="/websocket-hibernation">WebSocket Hibernation</a>
					<a href="/sql-basic">SQL Basic</a>
				</div>
			</body>
		</html>
	);
});

app.route('/counter-basic', counterBasic);
app.route('/simulation', simulation);
app.route('/websocket-hibernation', webSocketHibernation);
app.route('/sql-basic', sqlBasic);
export default app;

export { Counter } from './counter-basic/Counter';

export { World } from './simulation/World';
export { Weather } from './simulation/Weather';
export { Plant } from './simulation/Plant';

export { WebSocketHibernationServer } from './websocket-hibernation/WebSocketHibernationServer';
export { SQLBasic } from './sql-basic/SQLBasic';
