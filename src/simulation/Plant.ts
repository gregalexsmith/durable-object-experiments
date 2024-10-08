import { DurableObject } from 'cloudflare:workers';

export class Plant extends DurableObject {
	env: Env;
	data!: {
		height: number;
		water: number;
		energy: number;
		position: { x: number; y: number };
	};

	constructor(state: DurableObjectState, env: Env) {
		super(state, env);
		this.env = env;
	}

	async initialize() {
		let stored = (await this.ctx.storage.get('data')) as typeof this.data;
		this.data = stored || {
			height: 1,
			water: 50,
			energy: 50,
			position: { x: Math.floor(Math.random() * 100), y: Math.floor(Math.random() * 100) },
		};
	}

	async getState() {
		await this.initialize();
		return this.data;
	}

	async update(weatherConditions: { sunlight: number; rain: number }) {
		await this.initialize();
		// Photosynthesis
		if (weatherConditions.sunlight > 30) {
			this.data.energy += 20;
		}

		// Absorb water
		if (weatherConditions.rain > 20) {
			this.data.water += 20;
		}

		// Grow if conditions are good
		console.log('this.data.energy', this.data.energy);
		console.log('this.data.water', this.data.water);

		if (this.data.energy > 70 && this.data.water > 30) {
			this.data.height += 1;
			this.data.energy -= 10;
			this.data.water -= 10;
		}

		// Natural energy consumption
		this.data.energy = Math.max(0, this.data.energy - 2);
		this.data.water = Math.max(0, this.data.water - 2);

		// Plant dies if it runs out of energy or water
		if (this.data.energy <= 0 || this.data.water <= 0) {
			await this.env.WORLD.get(this.env.WORLD.idFromName('world')).removePlant(this.ctx.id);
			return null;
		}

		await this.ctx.storage.put('data', this.data);
		return this.data;
	}
}
