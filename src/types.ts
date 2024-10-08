import { Counter } from './counter-basic/Counter';
import { World } from './simulation/World';
import { Plant } from './simulation/Plant';
import { Weather } from './simulation/Weather';

export type Context = {
	Bindings: {
		COUNTERS: DurableObjectNamespace<Counter>;
		WORLD: DurableObjectNamespace<World>;
		PLANTS: DurableObjectNamespace<Plant>;
		WEATHER: DurableObjectNamespace<Weather>;
		ASSETS: Fetcher;
	};
	Variables: {};
};
