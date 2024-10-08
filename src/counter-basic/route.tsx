import { Hono } from 'hono';
import type { Context } from '../types';
import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer';
import { Fragment } from 'hono/jsx/jsx-runtime';

const app = new Hono<Context>();

app.get(
	'/*',
	jsxRenderer(async ({ children }) => {
		const c = useRequestContext();
		const name = c.req.param('name');

		let count = null;
		if (name) {
			let id = c.env.COUNTERS.idFromName(name);
			let stub = c.env.COUNTERS.get(id);
			count = await stub.getCounterValue();
		}

		return (
			<html>
				<head>
					<title>Counter Basic</title>
				</head>
				<body>
					<h1>Counter Basic</h1>
					<form action="/counter-basic" method="post">
						<input type="text" name="name" placeholder="Enter name" value={name} />
						<button type="submit">Get Counter</button>
					</form>
					{count && <p>Count: {count}</p>}
					{children}
				</body>
			</html>
		);
	})
);

app.get('/', (c) => {
	return c.render('');
});

app.get('/:name', async (c) => {
	const name = c.req.param('name');

	if (!name) {
		return new Response('Not found', { status: 404 });
	}

	return c.render(
		<Fragment>
			<form action={`/counter-basic/${name}/increment`} method="post">
				<button type="submit">Increment</button>
			</form>
			<form action={`/counter-basic/${name}/decrement`} method="post">
				<button type="submit">Decrement</button>
			</form>
		</Fragment>
	);
});

app.post('/', async (c) => {
	const formData = await c.req.formData();
	const name = formData.get('name');
	console.log(name);
	if (!name) {
		return new Response('Not found', { status: 404 });
	}

	return c.redirect(`/counter-basic/${name}`);
});

app.post('/:name/increment', async (c) => {
	const name = c.req.param('name');
	if (!name) {
		return new Response('Not found', { status: 404 });
	}
	let id = c.env.COUNTERS.idFromName(name);
	let stub = c.env.COUNTERS.get(id);
	await stub.increment();
	return c.redirect(`/counter-basic/${name}`);
});

app.post('/:name/decrement', async (c) => {
	const name = c.req.param('name');
	if (!name) {
		return new Response('Not found', { status: 404 });
	}
	let id = c.env.COUNTERS.idFromName(name);
	let stub = c.env.COUNTERS.get(id);
	await stub.decrement();
	return c.redirect(`/counter-basic/${name}`);
});

export default app;
