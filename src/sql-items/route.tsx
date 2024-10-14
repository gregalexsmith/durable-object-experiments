import { Hono } from 'hono';
import type { Context } from '../types';
import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer';

const app = new Hono<Context>();

const EXAMPLE_DO_ID = 'default_example';
const BASE_URL = '/sql-items';

app.get(
	'/*',
	jsxRenderer(async () => {
		const c = useRequestContext<Context>();
		const id = c.env.SQL_ITEMS.idFromName(EXAMPLE_DO_ID);
		const stub = c.env.SQL_ITEMS.get(id);
		const items = await stub.getItems();

		return (
			<html>
				<body>
					<a href="/">Home</a>
					<h1>Items</h1>
					<form action={BASE_URL} method="post">
						<input type="text" name="content" placeholder="Enter a task" autoFocus />
						<button type="submit">Add Item</button>
					</form>
					<ul>
						{items.map((item) => (
							<li key={item.id}>
								{item.id}: {item.content}
								<form action={`${BASE_URL}/${item.id}/delete`} method="post" style={{ display: 'inline', marginLeft: '10px' }}>
									<button type="submit">X</button>
								</form>
							</li>
						))}
					</ul>
				</body>
			</html>
		);
	})
);

app.get('/', (c) => {
	return c.render('');
});

app.post('/', async (c) => {
	const formData = await c.req.formData();
	const content = formData.get('content');
	if (!content) {
		return new Response('Bad request', { status: 400 });
	}

	const id = c.env.SQL_ITEMS.idFromName(EXAMPLE_DO_ID);
	const stub = c.env.SQL_ITEMS.get(id);
	await stub.createItem(content as string);

	return c.redirect(`${BASE_URL}`);
});

app.post('/:id/delete', async (c) => {
	const id = c.req.param('id');
	if (!id) {
		return new Response('Not found', { status: 404 });
	}
	const idNumber = parseInt(id);
	const idDurable = c.env.SQL_ITEMS.idFromName(EXAMPLE_DO_ID);
	const stub = c.env.SQL_ITEMS.get(idDurable);
	await stub.removeItem(idNumber);
	return c.redirect(`${BASE_URL}`);
});

export default app;
