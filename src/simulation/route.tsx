import { Hono } from 'hono';
import { Context } from '../types';

const app = new Hono<Context>();

app.post('/tick', async (c) => {
	const worldId = c.env.WORLD.idFromName('world');
	const worldObj = c.env.WORLD.get(worldId);
	const data = await worldObj.tick();
	return c.json(data);
});

app.get('/state', async (c) => {
	const worldId = c.env.WORLD.idFromName('world');
	const worldObj = c.env.WORLD.get(worldId);
	const data = await worldObj.getState();
	return c.json(data);
});

app.post('/addPlant', async (c) => {
	const worldId = c.env.WORLD.idFromName('world');
	const worldObj = c.env.WORLD.get(worldId);
	const plantId = crypto.randomUUID();
	await worldObj.addPlant(plantId);
	return c.json({ message: 'Plant added', id: plantId });
});

app.post('/resetState', async (c) => {
	const worldId = c.env.WORLD.idFromName('world');
	const worldObj = c.env.WORLD.get(worldId);
	await worldObj.resetState();
	return c.json({ message: 'State reset' });
});

export default app;
