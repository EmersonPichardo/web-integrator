import axios from 'axios';
import dotenv from 'dotenv';
import WebhookType from '../webhooks/webhookType';
import { webhookSpecificationManager } from '../webhooks/specifications/webhookSpecificationManager';
dotenv.config();

const AIRTABLE_API_URL = process.env.AIRTABLE_API_URL?.replace(/\/$/, ''); // remove trailing slash
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
if (!AIRTABLE_API_KEY || !AIRTABLE_API_URL || !AIRTABLE_BASE_ID) throw new Error('Missing Airtable configuration in environment variables');

interface AirtableWebhook {
	id: string;
	notificationUrl: string;
	expirationTime: Date;
}

interface AirtableGetWebhooksResponse {
	webhooks: AirtableWebhook[];
}

interface AirtableCreateWebhookResponse {
	id: string;
	expirationTime: Date;
}

interface AirtableRefreshWebhookResponse {
	expirationTime: Date;
}

const airtableApi = axios.create({
	baseURL: AIRTABLE_API_URL,
	headers: {
		Authorization: `Bearer ${AIRTABLE_API_KEY}`,
		'Content-Type': 'application/json',
	}
});

airtableApi.interceptors.response.use(
	response => response,
	error => {
		console.error('Airtable API Error:', error.response?.data || error.message);
		return Promise.reject(error);
	}
);

//Webhook management
const baseWebhookEndpoint = `/bases/${AIRTABLE_BASE_ID}/webhooks`;

const getWebhooks = async (): Promise<AirtableWebhook[]> => {
	const response = await airtableApi.get<AirtableGetWebhooksResponse>(baseWebhookEndpoint);
	return response?.data?.webhooks;
}

const createWebhook = async (type: WebhookType): Promise<AirtableCreateWebhookResponse> => {
	const webhookSpecification = webhookSpecificationManager.get[type];
	const response = await airtableApi.post<AirtableCreateWebhookResponse>(baseWebhookEndpoint, webhookSpecification);
	return response?.data;
}

const refreshWebhook = async (webhookId: string): Promise<Date> => {
	const response = await airtableApi.post<AirtableRefreshWebhookResponse>(`${baseWebhookEndpoint}/${webhookId}/refresh`);
	return response?.data?.expirationTime;
};

//Tickets management
const baseTicketsEndpoint = `/bases/${AIRTABLE_BASE_ID}/tables/{tickets-table-id}`;

const updateTicketStatus = async (ticketId: string, status: string): Promise<void> => {
	await airtableApi.patch(`${baseTicketsEndpoint}/records/${ticketId}`, { fields: { Status: status } });
}

export const airtableClient = {
	webHooks: {
		get: getWebhooks,
		create: createWebhook,
		refresh: refreshWebhook
	},
	tickets: {
		updateStatus: updateTicketStatus
	}
}
