import { DurableObject } from 'cloudflare:workers';
import { Context } from '../types';

export class World extends DurableObject {
	env: Context['Bindings'];
	data!: {
		plants: Record<string, any>;
		tickCount: number;
	};

	constructor(state: DurableObjectState, env: Env) {
		super(state, env);
		this.env = env;
	}

	async initialize() {
		let stored = (await this.ctx.storage.get('data')) as typeof this.data;
		this.data = stored || { plants: {}, tickCount: 0 };
	}

	async getState() {
		await this.initialize();
		return this.data;
	}

	async resetState() {
		await this.initialize();
		this.data = { plants: {}, tickCount: 0 };
		await this.ctx.storage.put('data', this.data);
	}

	async tick() {
		await this.initialize();
		this.data.tickCount++;

		// Update weather
		let weatherActor = this.env.WEATHER.get(this.env.WEATHER.idFromName('weather'));
		let weatherConditions = await weatherActor.update();

		// Update all plants
		let updatePromises = [];
		for (let plantId in this.data.plants) {
			let plantActor = this.env.PLANTS.get(this.env.PLANTS.idFromName(plantId));
			console.log('weatherConditions', weatherConditions);
			let updatePromise = plantActor.update(weatherConditions).then((response) => {
				if (response === null) {
					delete this.data.plants[plantId];
				} else {
					this.data.plants[plantId] = response;
				}
			});
			updatePromises.push(updatePromise);
		}

		await Promise.all(updatePromises);

		// Spawn new plant occasionally
		if (Math.random() < 0.1) {
			let newPlantId = crypto.randomUUID();
			await this.addPlant(newPlantId);
		}

		await this.ctx.storage.put('data', this.data);

		return {
			tickCount: this.data.tickCount,
			weather: weatherConditions,
			plantCount: Object.keys(this.data.plants).length,
		};
	}

	async addPlant(id: string) {
		await this.initialize();
		let plantActor = this.env.PLANTS.get(this.env.PLANTS.idFromName(id));
		this.data.plants[id] = await plantActor.getState();
		await this.ctx.storage.put('data', this.data);
		return { message: 'Plant added', id };
	}

	async removePlant(id: string) {
		await this.initialize();
		delete this.data.plants[id];
		await this.ctx.storage.put('data', this.data);
		return { message: 'Plant removed', id };
	}
}
