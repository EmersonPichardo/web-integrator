import axios from 'axios';
import dotenv from 'dotenv';
import WebhookType from './webhooks/webhookType';
import { webhookSpecificationManager } from './webhooks/specifications/webhookSpecificationManager';
dotenv.config();

const AIRTABLE_API_URL = process.env.AIRTABLE_API_URL?.replace(/\/$/, ''); // remove trailing slash
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_API_URL || !AIRTABLE_BASE_ID)
	throw new Error('Missing AIRTABLE_API_KEY or AIRTABLE_API_URL or AIRTABLE_BASE_ID in environment variables');

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

const getWebhooks = async (): Promise<any[]> => {
	const response = await airtableApi.get(baseWebhookEndpoint);
	return response.data.webhooks;
}

const createWebhook = async (type: WebhookType): Promise<any> => {
	const webhookSpecification = webhookSpecificationManager.get[type];
	const response = await airtableApi.post(baseWebhookEndpoint, webhookSpecification);
	return response.data;
}

export const airtableClient = {
	webHooks: {
		get: getWebhooks,
		create: createWebhook
	}
}
