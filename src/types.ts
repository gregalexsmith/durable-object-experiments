import { Counter } from './counter/Counter';
import { World } from './simulation/World';
import { Plant } from './simulation/Plant';
import { Weather } from './simulation/Weather';
import { WebSocketHibernationServer } from './websocket-hibernation/WebSocketHibernationServer';
import { SQLItems } from './sql-items/SQLItems';
import { AIExample } from './ai-example/AIExample';
import { AIChatParticipant } from './ai-chat-participant/AIChatParticipant';
import { PartyServerExample } from './partyserver/PartyServerExample';
export type Context = {
	Bindings: {
		COUNTERS: DurableObjectNamespace<Counter>;
		WORLD: DurableObjectNamespace<World>;
		PLANTS: DurableObjectNamespace<Plant>;
		WEATHER: DurableObjectNamespace<Weather>;
		WEBSOCKET_HIBERNATION_SERVER: DurableObjectNamespace<WebSocketHibernationServer>;
		SQL_ITEMS: DurableObjectNamespace<SQLItems>;
		AI_EXAMPLE: DurableObjectNamespace<AIExample>;
		AI_CHAT_PARTICIPANT: DurableObjectNamespace<AIChatParticipant>;
		PARTY_SERVER_EXAMPLE: DurableObjectNamespace<PartyServerExample>;
		ASSETS: Fetcher;
		AI: Ai;
		OPENAI_API_KEY: string;
		CF_API_TOKEN: string;
		CF_GATEWAY_BASE_URL: string;
	};
	Variables: {};
};
