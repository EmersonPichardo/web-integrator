import dotenv from 'dotenv';
import WebhookType from './webhookType';
import { airtableClient } from '../airtableClient';
dotenv.config();

const WEBHOOK_URL = process.env.WEBHOOK_URL?.replace(/\/$/, ''); // remove trailing slash

if (!WEBHOOK_URL) throw new Error('Missing WEBHOOK_URL in environment variables');

export async function initWebhooks() {
	for (const type of Object.values(WebhookType)) {
		const webhook = await ensureWebhook(type);
		if (webhook) {
			console.log(`✅ Webhook ready for ${type}:`, webhook.id);
		}
	}
}

async function ensureWebhook(type: WebhookType): Promise<{ id: string } | null> {
	const webhooks = await airtableClient.webHooks.get();
	const existing = webhooks.find(_ => _.notificationUrl === `${WEBHOOK_URL}/${type}`);

	if (existing) return { id: existing.id };

	const newWebhook = await airtableClient.webHooks.create(type);
	return { id: newWebhook.id };
}
