import { Counter } from './counter-basic/Counter';

export type Context = {
	Bindings: {
		COUNTERS: DurableObjectNamespace<Counter>;
	};
	Variables: {};
};
