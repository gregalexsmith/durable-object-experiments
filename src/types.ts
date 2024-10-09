import { Counter } from './counter-basic/Counter';
import { World } from './simulation/World';
import { Plant } from './simulation/Plant';
import { Weather } from './simulation/Weather';
import { WebSocketHibernationServer } from './websocket-hibernation/WebSocketHibernationServer';

export type Context = {
	Bindings: {
		COUNTERS: DurableObjectNamespace<Counter>;
		WORLD: DurableObjectNamespace<World>;
		PLANTS: DurableObjectNamespace<Plant>;
		WEATHER: DurableObjectNamespace<Weather>;
		WEBSOCKET_HIBERNATION_SERVER: DurableObjectNamespace<WebSocketHibernationServer>;
		ASSETS: Fetcher;
	};
	Variables: {};
};
