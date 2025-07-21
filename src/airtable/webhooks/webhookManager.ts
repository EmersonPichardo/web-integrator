import dotenv from 'dotenv';
import WebhookType from './webhookType';
import { airtableClient } from '../client/airtableClient';
dotenv.config();

const WEBHOOK_URL = process.env.WEBHOOK_URL?.replace(/\/$/, ''); // remove trailing slash
if (!WEBHOOK_URL) throw new Error('Missing WEBHOOK_URL in environment variables');

export const initWebhooks = async (): Promise<void> => {
	const webhooks = await airtableClient.webHooks.get();

	for (const type of Object.values(WebhookType)) {
		const existing = webhooks.find(_ => _.notificationUrl === `${WEBHOOK_URL}/${type}`);

		if (existing) {
			var expirationTime = await airtableClient.webHooks.refresh(existing.id);
			scheduleWebhookRefresh(existing.id, expirationTime);
		} else {
			const newWebhook = await airtableClient.webHooks.create(type);
			scheduleWebhookRefresh(newWebhook.id, newWebhook.expirationTime);
		}
	}
}

function scheduleWebhookRefresh(webhookId: string, expirationTime: Date) {
	setInterval(() => {
		airtableClient.webHooks.refresh(webhookId);
	}, expirationTime.getTime() - Date.now() - (60000 * 5)); // Refresh 5 minute before expiration
}

