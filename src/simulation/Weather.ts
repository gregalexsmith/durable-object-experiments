import { DurableObject } from 'cloudflare:workers';

export class Weather extends DurableObject {
	data!: {
		sunlight: number;
		rain: number;
	};

	constructor(state: DurableObjectState, env: Env) {
		super(state, env);
		this.env = env;
	}

	async initialize() {
		let stored = (await this.ctx.storage.get('data')) as typeof this.data;
		this.data = stored || { sunlight: 50, rain: 50 };
	}

	async getState() {
		await this.initialize();
		return this.data;
	}

	async update() {
		await this.initialize();
		// Simple weather patterns
		this.data.sunlight += Math.floor(Math.random() * 21) - 10; // -10 to +10
		this.data.rain += Math.floor(Math.random() * 21) - 10; // -10 to +10

		// Keep values within bounds
		this.data.sunlight = Math.max(5, Math.min(100, this.data.sunlight));
		this.data.rain = Math.max(5, Math.min(100, this.data.rain));

		await this.ctx.storage.put('data', this.data);
		return {
			sunlight: this.data.sunlight,
			rain: this.data.rain,
		};
	}
}
