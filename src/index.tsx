import { Hono } from 'hono';
import counter from './counter/route';
import simulation from './simulation/route';
import webSocketHibernation from './websocket-hibernation/route';
import sqlTasks from './sql-tasks/route';
import aiExample from './ai-example/route';
import aiChatParticipant from './ai-chat-participant/route';
import type { Context } from './types';

const app = new Hono<Context>();

app.get('/', (c) => {
	return c.html(
		<html>
			<body>
				<h1>Durable Object Examples</h1>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<a href="/counter">Counter</a>
					<a href="/simulation">World Simulation</a>
					<a href="/websocket-hibernation">WebSocket Hibernation</a>
					<a href="/sql-tasks">SQL Tasks</a>
					<a href="/ai-example">AI Example</a>
					<a href="/ai-chat-participant">AI Chat Participant</a>
				</div>
			</body>
		</html>
	);
});

app.route('/counter', counter);
app.route('/simulation', simulation);
app.route('/websocket-hibernation', webSocketHibernation);
app.route('/sql-tasks', sqlTasks);
app.route('/ai-example', aiExample);
app.route('/ai-chat-participant', aiChatParticipant);

export default app;

export { Counter } from './counter/Counter';

export { World } from './simulation/World';
export { Weather } from './simulation/Weather';
export { Plant } from './simulation/Plant';

export { WebSocketHibernationServer } from './websocket-hibernation/WebSocketHibernationServer';
export { SQLTasks } from './sql-tasks/SQLTasks';
export { AIExample } from './ai-example/AIExample';
export { AIChatParticipant } from './ai-chat-participant/AIChatParticipant';
