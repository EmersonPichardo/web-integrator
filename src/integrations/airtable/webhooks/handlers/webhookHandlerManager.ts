import WebhookType from "../webhookType";
import { priceListUploadedWebhookHandler } from "./priceListUploaded.handler";

export const webhookHandlers: Record<WebhookType, (data: any) => Promise<void>> = {
	[WebhookType.PriceListUploaded]: priceListUploadedWebhookHandler
}

export const webhookHandlerManager = {
	get: webhookHandlers
}