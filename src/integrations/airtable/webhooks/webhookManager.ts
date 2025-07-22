import dotenv from 'dotenv';
import WebhookType from './webhookType';
import { airtableClient } from '../client/airtableClient';
dotenv.config();

const WEBHOOK_URL = process.env.WEBHOOK_URL?.replace(/\/$/, ''); // remove trailing slash
if (!WEBHOOK_URL) throw new Error('Missing WEBHOOK_URL in environment variables');

const initWebhooks = async (): Promise<void> => {
	const webhooks = await airtableClient.webHooks.get();

	for (const type of Object.values(WebhookType)) {
		const existing = webhooks.find(_ => _.notificationUrl === `${WEBHOOK_URL}/${type}`);

		if (existing) await airtableClient.webHooks.delete(existing.id);

		const newWebhook = await airtableClient.webHooks.create(type);
		scheduleWebhookRefresh(newWebhook.id, new Date(newWebhook.expirationTime));
	}
}

function scheduleWebhookRefresh(webhookId: string, expirationTime: Date) {
	setInterval(() => {
		airtableClient.webHooks.refresh(webhookId);
	}, expirationTime.getTime() - Date.now() - (60000 * 5)); // Refresh 5 minute before expiration
}

export const webhookManager = {
	initWebhooks
}