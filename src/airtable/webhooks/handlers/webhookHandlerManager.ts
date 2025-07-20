import WebhookType from "../webhookType";

export const webhookHandlers: Record<WebhookType, (data: any) => Promise<void>> = {
	[WebhookType.PriceListUploaded]: priceListUploadedWebhookHandler
}

export const webhookHandlerManager = {
	get: webhookHandlers
}