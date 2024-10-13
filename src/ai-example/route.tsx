import { Hono } from 'hono';
import type { Context } from '../types';
import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer';

const app = new Hono<Context>();

const EXAMPLE_DO_ID = 'default_example';
const BASE_URL = '/ai-example';

app.get(
	'/*',
	jsxRenderer(async () => {
		const c = useRequestContext<Context>();
		const id = c.env.AI_EXAMPLE.idFromName(EXAMPLE_DO_ID);
		const stub = c.env.AI_EXAMPLE.get(id);
		const messages = await stub.getMessages();

		return (
			<html>
				<body>
					<a href="/">Home</a>
					<h1>AI Example</h1>
					<div style={{ display: 'flex', gap: '10px' }}>
						<form action={BASE_URL} method="post">
							<input type="text" name="prompt" placeholder="Enter a prompt" autoFocus />
							<button type="submit">Generate Text</button>
						</form>
						<form action={`${BASE_URL}/clear`} method="post">
							<button type="submit">Clear Messages</button>
						</form>
					</div>

					<ul>
						{messages.map((message) => (
							<li key={message.id}>
								{message.role}: {message.content}
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
	const prompt = formData.get('prompt');
	if (!prompt) {
		return new Response('Bad request', { status: 400 });
	}

	const id = c.env.AI_EXAMPLE.idFromName(EXAMPLE_DO_ID);
	const stub = c.env.AI_EXAMPLE.get(id);
	await stub.generateText(prompt as string);

	return c.redirect(`${BASE_URL}`);
});

app.post('/clear', async (c) => {
	const id = c.env.AI_EXAMPLE.idFromName(EXAMPLE_DO_ID);
	const stub = c.env.AI_EXAMPLE.get(id);
	await stub.clearMessages();
	return c.redirect(`${BASE_URL}`);
});

export default app;
