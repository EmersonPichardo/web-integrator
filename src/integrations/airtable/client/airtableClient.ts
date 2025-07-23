import axios from 'axios';
import dotenv from 'dotenv';
import WebhookType from '../webhooks/webhookType';
import { webhookSpecificationManager } from '../webhooks/specifications/webhookSpecificationManager';
import { AirtableCreateWebhookResponse, AirtableGetWebhooksResponse, AirtableRefreshWebhookResponse, AirtableCustomerStatus, AirtableWebhook, AirtableWebhookPayloadResponse } from './airtableClient.types';
dotenv.config();

const AIRTABLE_API_BASE_URL = process.env.AIRTABLE_API_BASE_URL?.replace(/\/$/, ''); // remove trailing slash
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
if (!AIRTABLE_API_KEY || !AIRTABLE_API_BASE_URL || !AIRTABLE_BASE_ID) throw new Error('Missing Airtable configuration in environment variables');

const airtableApi = axios.create({
	baseURL: AIRTABLE_API_BASE_URL,
	headers: {
		Authorization: `Bearer ${AIRTABLE_API_KEY}`,
		'Content-Type': 'application/json'
	}
});

airtableApi.interceptors.response.use(
	response => response,
	error => {
		console.error('Airtable API Error:', error.response?.data || error.message);
		return Promise.reject(error);
	}
);

// Webhook management
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

const deleteWebhook = async (webhookId: string): Promise<void> => {
	await airtableApi.delete(`${baseWebhookEndpoint}/${webhookId}`);
}

const refreshWebhook = async (webhookId: string): Promise<Date> => {
	const response = await airtableApi.post<AirtableRefreshWebhookResponse>(`${baseWebhookEndpoint}/${webhookId}/refresh`);
	return response?.data?.expirationTime;
};

const getWebhookPayload = async (webhookId: string): Promise<AirtableWebhookPayloadResponse> => {
	const cursor = await getWebhookCursor(webhookId);
	const response = await airtableApi.get<AirtableWebhookPayloadResponse>(`${baseWebhookEndpoint}/${webhookId}/payloads?cursor=${cursor}`);
	await upsertWebhookCursor(webhookId, response?.data?.cursor || 0);
	return response?.data;
};

const baseWebhookCursorsEndpoint = `/${AIRTABLE_BASE_ID}/webhookCursors`;

const getWebhookCursor = async (webhookId: string): Promise<number> => {
	const queryParams = new URLSearchParams([
		['fields[]', 'Cursor'],
		['maxRecords', '1'],
		['filterByFormula', `{Webhook ID}="${webhookId}"`]
	]);
	const response = await airtableApi.get<any>(`${baseWebhookCursorsEndpoint}?${queryParams.toString()}`);
	return response?.data?.records[0]?.fields?.Cursor || 0;
};

const upsertWebhookCursor = async (webhookId: string, cursor: number): Promise<void> => {
	const upsertRequest = {
		performUpsert: { fieldsToMergeOn: ["Webhook ID"] },
		records: [{ fields: { "Webhook ID": webhookId, "Cursor": cursor } }]
	};

	await airtableApi.patch(baseWebhookCursorsEndpoint, upsertRequest);
};

// Customers management
const baseTicketsEndpoint = `/${AIRTABLE_BASE_ID}/customers`;

const updateCustomerStatus = async (recordId: string, status: AirtableCustomerStatus): Promise<void> => {
	await airtableApi.patch(`${baseTicketsEndpoint}/${recordId}`, { fields: { Status: status } });
};

// Errors management
const registerError = async (error: unknown): Promise<void> => {

};

export const airtableClient = {
	webHooks: {
		get: getWebhooks,
		create: createWebhook,
		delete: deleteWebhook,
		refresh: refreshWebhook,
		getPayload: getWebhookPayload
	},
	customers: {
		updateStatus: updateCustomerStatus
	},
	error: {
		register: registerError
	}
}
