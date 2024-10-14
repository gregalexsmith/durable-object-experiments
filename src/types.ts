import { Counter } from './counter/Counter';
import { World } from './simulation/World';
import { Plant } from './simulation/Plant';
import { Weather } from './simulation/Weather';
import { WebSocketHibernationServer } from './websocket-hibernation/WebSocketHibernationServer';
import { SQLTasks } from './sql-tasks/SQLTasks';
import { AIExample } from './ai-example/AIExample';
import { AIChatParticipant } from './ai-chat-participant/AIChatParticipant';

export type Context = {
	Bindings: {
		COUNTERS: DurableObjectNamespace<Counter>;
		WORLD: DurableObjectNamespace<World>;
		PLANTS: DurableObjectNamespace<Plant>;
		WEATHER: DurableObjectNamespace<Weather>;
		WEBSOCKET_HIBERNATION_SERVER: DurableObjectNamespace<WebSocketHibernationServer>;
		SQL_TASKS: DurableObjectNamespace<SQLTasks>;
		AI_EXAMPLE: DurableObjectNamespace<AIExample>;
		AI_CHAT_PARTICIPANT: DurableObjectNamespace<AIChatParticipant>;
		ASSETS: Fetcher;
		AI: Ai;
		OPENAI_API_KEY: string;
		CF_API_TOKEN: string;
		CF_GATEWAY_BASE_URL: string;
	};
	Variables: {};
};
