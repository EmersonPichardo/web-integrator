import express, { Request, Response } from 'express';
import WebhookType from './integrations/airtable/webhooks/webhookType';
import { webhookHandlerManager } from './integrations/airtable/webhooks/handlers/webhookHandlerManager';
import { webhookManager } from './integrations/airtable/webhooks/webhookManager';
import Airtable from 'airtable';
import { airtableClient } from './integrations/airtable/client/airtableClient';

const PORT = process.env.PORT || 3000;

if (!PORT) throw new Error('Missing PORT in environment variables');

const app = express();
app.use(express.json());

app.post('/webhook/:type', async (request: Request, response: Response) => {
	const type = request.params.type as WebhookType;
	const webhook = request.body.webhook;

	if (!Object.values(WebhookType).includes(type))
		return response.status(400).send('Invalid webhook type');

	const handler = webhookHandlerManager.get[type];

	if (handler) {
		var webhookPayload = await airtableClient.webHooks.getPayload(webhook?.id);

		await handler(request.body);
	}

	return response.status(204).send();
});

app.listen(PORT, webhookManager.initWebhooks);