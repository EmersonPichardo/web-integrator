// Webhooks
export interface AirtableWebhook {
	id: string;
	notificationUrl: string;
	expirationTime: Date;
}
export interface AirtableGetWebhooksResponse {
	webhooks: AirtableWebhook[];
}
export interface AirtableCreateWebhookResponse {
	id: string;
	expirationTime: Date;
}
export interface AirtableRefreshWebhookResponse {
	expirationTime: Date;
}
export interface AirtableWebhookPayloadResponse {
	payloads: [{
		actionMetadata: {
			sourceMetadata: unknown
		}
	}],
	cursor: number;
}

// Customers
export enum AirtableCustomerStatus {
	UploadPriceListAndCustomerGroup = 'Upload PS & CG',
	ReviewSparklayer = 'Review Sparklayer'
}
