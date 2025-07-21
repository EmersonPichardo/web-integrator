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
