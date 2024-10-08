import { Hono } from 'hono';
import counterBasic from './counter-basic/route';
import simulation from './simulation/route';
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
				</div>
			</body>
		</html>
	);
});

app.route('/counter-basic', counterBasic);
app.route('/simulation', simulation);

export default app;

export { Counter } from './counter-basic/Counter';

export { World } from './simulation/World';
export { Weather } from './simulation/Weather';
export { Plant } from './simulation/Plant';
