import { Hono } from 'hono';
import type { Context } from '../types';
import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer';
import { streamText } from 'hono/streaming';
import OpenAI from 'openai';

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
				<head>
					<script src="/streaming.js"></script>
				</head>
				<body>
					<a href="/">Home</a>
					<h1>AI Example</h1>
					<div style={{ display: 'flex', gap: '10px' }}>
						<form action={`${BASE_URL}/clear`} method="post">
							<button type="submit">Clear Messages</button>
						</form>

						<form action={`${BASE_URL}/do-generate-text`} method="post">
							<input type="text" name="prompt" placeholder="Enter a prompt" autoFocus />
							<button type="submit">D.O. Generate Text</button>
						</form>

						<form action={`${BASE_URL}/do-stream-text`} method="post" data-stream-target="#messageTarget">
							<input type="text" name="prompt" placeholder="Enter a prompt" autoFocus />
							<button type="submit">D.O. Stream Text</button>
						</form>

						<form action={`${BASE_URL}/stream-openai`} method="post" data-stream-target="#responseTarget">
							<input type="text" name="prompt" placeholder="Enter a prompt" autoFocus />
							<button type="submit">Stream OpenAI</button>
						</form>
					</div>

					<ul>
						{messages.map((message) => (
							<div key={message.id}>
								<div>{message.role}</div>
								<pre style={{ whiteSpace: 'pre-wrap' }}>{message.content}</pre>
							</div>
						))}
						<div id="messageTarget"></div>
					</ul>

					<div id="responseTarget"></div>
				</body>
			</html>
		);
	})
);

app.get('/', (c) => {
	return c.render('');
});

app.post('/clear', async (c) => {
	const id = c.env.AI_EXAMPLE.idFromName(EXAMPLE_DO_ID);
	const stub = c.env.AI_EXAMPLE.get(id);
	await stub.clearMessages();
	return c.redirect(`${BASE_URL}`);
});

app.post('/do-generate-text', async (c) => {
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

app.post('/do-stream-text', async (c) => {
	const formData = await c.req.formData();
	const prompt = formData.get('prompt');
	if (!prompt) {
		return new Response('Bad request', { status: 400 });
	}

	const id = c.env.AI_EXAMPLE.idFromName(EXAMPLE_DO_ID);
	const stub = c.env.AI_EXAMPLE.get(id);
	const stream = await stub.streamText(prompt as string);

	c.header('Content-Encoding', 'Identity');

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		},
	});
});

app.post('/stream-openai', async (c) => {
	const formData = await c.req.formData();
	const prompt = formData.get('prompt') as string;
	if (!prompt) {
		return new Response('Bad request', { status: 400 });
	}

	const openai = new OpenAI({
		apiKey: c.env.OPENAI_API_KEY,
		baseURL: `${c.env.CF_GATEWAY_BASE_URL}/openai`,
	});

	const completion = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		stream: true,
		max_tokens: 1000,
		messages: [{ role: 'user', content: prompt }],
	});

	c.header('Content-Encoding', 'Identity');

	return streamText(c, async (stream) => {
		for await (const chunk of completion) {
			if (chunk.choices[0].delta.content) {
				await stream.write(chunk.choices[0].delta.content);
			}
		}
	});
});

export default app;
