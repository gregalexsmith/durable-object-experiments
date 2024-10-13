import { Counter } from './counter/Counter';
import { World } from './simulation/World';
import { Plant } from './simulation/Plant';
import { Weather } from './simulation/Weather';
import { WebSocketHibernationServer } from './websocket-hibernation/WebSocketHibernationServer';
import { SQLTasks } from './sql-tasks/SQLTasks';

export type Context = {
	Bindings: {
		COUNTERS: DurableObjectNamespace<Counter>;
		WORLD: DurableObjectNamespace<World>;
		PLANTS: DurableObjectNamespace<Plant>;
		WEATHER: DurableObjectNamespace<Weather>;
		WEBSOCKET_HIBERNATION_SERVER: DurableObjectNamespace<WebSocketHibernationServer>;
		SQL_TASKS: DurableObjectNamespace<SQLTasks>;
		ASSETS: Fetcher;
	};
	Variables: {};
};
