import { Hono } from 'hono';
import type { Context } from '../types';
import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer';

const app = new Hono<Context>();

const EXAMPLE_DO_ID = 'default_example';
const BASE_URL = '/sql-tasks';

app.get(
	'/*',
	jsxRenderer(async () => {
		const c = useRequestContext<Context>();
		const id = c.env.SQL_TASKS.idFromName(EXAMPLE_DO_ID);
		const stub = c.env.SQL_TASKS.get(id);
		const tasks = await stub.getTasks();

		return (
			<html>
				<body>
					<a href="/">Home</a>
					<h1>Tasks</h1>
					<form action={BASE_URL} method="post">
						<input type="text" name="content" placeholder="Enter a task" autoFocus />
						<button type="submit">Add Task</button>
					</form>
					<ul>
						{tasks.map((task) => (
							<li key={task.id}>
								{task.id}: {task.content}
								<form action={`${BASE_URL}/${task.id}/delete`} method="post" style={{ display: 'inline', marginLeft: '10px' }}>
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

	const id = c.env.SQL_TASKS.idFromName(EXAMPLE_DO_ID);
	const stub = c.env.SQL_TASKS.get(id);
	await stub.createTask(content as string);

	return c.redirect(`${BASE_URL}`);
});

app.post('/:id/delete', async (c) => {
	const id = c.req.param('id');
	if (!id) {
		return new Response('Not found', { status: 404 });
	}
	const idNumber = parseInt(id);
	const idDurable = c.env.SQL_TASKS.idFromName(EXAMPLE_DO_ID);
	const stub = c.env.SQL_TASKS.get(idDurable);
	await stub.removeTask(idNumber);
	return c.redirect(`${BASE_URL}`);
});

export default app;
