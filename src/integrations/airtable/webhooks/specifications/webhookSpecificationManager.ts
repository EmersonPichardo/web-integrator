import WebhookType from "../webhookType";
import { priceListUploadedWebhookSpecification } from "./priceListUploaded.spec";
import { WebhookSpecification } from "./webhookSpecification";

const WEBHOOK_URL = process.env.WEBHOOK_URL?.replace(/\/$/, ''); // remove trailing slash
if (!WEBHOOK_URL) throw new Error('Missing WEBHOOK_URL in environment variables');

export const webhookSpecifications: Record<WebhookType, { notificationUrl: string, specification: WebhookSpecification }> = {
	[WebhookType.PriceListUploaded]: {
		notificationUrl: `${WEBHOOK_URL}/${WebhookType.PriceListUploaded}`,
		specification: priceListUploadedWebhookSpecification
	}
}

export const webhookSpecificationManager = {
	get: webhookSpecifications
}