import express, { Request, Response } from 'express';
import WebhookType from './integrations/airtable/webhooks/webhookType';
import { webhookHandlerManager } from './integrations/airtable/webhooks/handlers/webhookHandlerManager';
import { webhookManager } from './integrations/airtable/webhooks/webhookManager';
import { airtableClient } from './integrations/airtable/client/airtableClient';

const PORT = process.env.PORT || 3000;
if (!PORT) throw new Error('Missing PORT in environment variables');

const app = express();
app.use(express.json());

app.post('/webhooks/:type', async (request: Request, response: Response) => {
	try {
		const type = request.params.type as WebhookType;
		const webhook = request.body.webhook;

		if (!Object.values(WebhookType).includes(type))
			return response.status(400).send('Invalid webhook type');

		const handler = webhookHandlerManager.get[type];

		if (handler) {
			var airtableWebhookPayloadResponse = await airtableClient.webHooks.getPayload(webhook?.id);
			for (const payload of airtableWebhookPayloadResponse.payloads) await handler(payload)
		}
	} catch (error: unknown) {
		await registerError(error);
	}

	return response.status(200).send();
});

app.listen(PORT, webhookManager.initWebhooks);

const registerError = async (error: unknown) => {
	try {
		await airtableClient.error.register(error);
	} catch (innerError) {
		console.error('Failed to register error:', innerError);
	}
};