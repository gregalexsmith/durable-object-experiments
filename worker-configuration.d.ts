// Generated by Wrangler by running `wrangler types`

interface Env {
	COUNTERS: DurableObjectNamespace<Counter>;
	WORLD: DurableObjectNamespace<World>;
	PLANTS: DurableObjectNamespace<Plant>;
	WEATHER: DurableObjectNamespace<Weather>;
	WEBSOCKET_HIBERNATION_SERVER: DurableObjectNamespace<WebSocketHibernationServer>;
	TASKS: DurableObjectNamespace<SQLExample>;
	ASSETS: Fetcher;
}
