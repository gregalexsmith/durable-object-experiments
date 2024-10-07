import { Hono } from 'hono';
import counterBasic from './counter-basic/route';
import type { Context } from './types';

const app = new Hono<Context>();

app.get('/', (c) => {
	return c.html(
		<html>
			<body>
				<h1>Durable Object Examples</h1>
				<div>
					<a href="/counter-basic">Counter Basic</a>
				</div>
			</body>
		</html>
	);
});

app.route('/counter-basic', counterBasic);

export default app;

export { Counter } from './counter-basic/Counter';
