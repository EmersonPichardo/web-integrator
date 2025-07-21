import axios from 'axios';
import dotenv from 'dotenv';
import { CustomerResponse } from './shopifyClient.types';
dotenv.config();

const SHOPIFY_BASE_URL = process.env.SHOPIFY_BASE_URL?.replace(/\/$/, ''); // remove trailing slash
const SHOPIFY_API_TOKEN = process.env.SHOPIFY_API_TOKEN;
if (!SHOPIFY_BASE_URL || !SHOPIFY_API_TOKEN) throw new Error('Missing Shopify configurations in environment variables');

const shopifyApi = axios.create({
	baseURL: SHOPIFY_BASE_URL,
	headers: { 'X-Shopify-Access-Token': SHOPIFY_API_TOKEN, 'Content-Type': 'application/json' }
});

shopifyApi.interceptors.response.use(
	response => response,
	error => {
		console.error('Shopify API Error:', error.response?.data || error.message);
		return Promise.reject(error);
	}
);

// Customers management
const addCustomerTags = async (customerId: number, tags: string[]): Promise<void> => {
	const customerRes = await shopifyApi.get<CustomerResponse>(`/customers/${customerId}.json`);
	const existingTags = customerRes.data.customer.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length);
	const updatedTags = Array.from(new Set([...existingTags, tags]));

	await shopifyApi.put(`/customers/${customerId}.json`, {
		customer: { id: customerId, tags: updatedTags.join(', ') }
	});
}

export const shopifyClient = {
	customers: {
		addTags: addCustomerTags
	}
}
