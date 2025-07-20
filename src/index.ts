import express, { Request, Response } from 'express';
import { initWebhooks } from './airtable/webhooks/webhookManager';
import WebhookType from './airtable/webhooks/webhookType';
import { webhookHandlerManager } from './airtable/webhooks/handlers/webhookHandlerManager';

const PORT = process.env.PORT || 3000;

if (!PORT) throw new Error('Missing PORT in environment variables');

const app = express();
app.use(express.json());

app.post('/webhook/:type', async (request: Request, response: Response) => {
	const type = request.params.type as WebhookType;
	const body = request.body;

	if (!Object.values(WebhookType).includes(type))
		return response.status(400).send('Invalid webhook type');

	const handler = webhookHandlerManager.get[type];
	if (handler) await handler(body);

	console.log(`Webhook [${type}] Event:`);
	console.dir(body, { depth: null });

	return response.status(200).send('OK');
});

app.listen(PORT, initWebhooks);