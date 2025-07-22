import axios from 'axios';
import dotenv from 'dotenv';
import { get } from 'http';
dotenv.config();

const SHOPIFY_API_BASE_URL = process.env.SHOPIFY_API_BASE_URL?.replace(/\/$/, ''); // remove trailing slash
const SHOPIFY_API_TOKEN = process.env.SHOPIFY_API_TOKEN;
if (!SHOPIFY_API_BASE_URL || !SHOPIFY_API_TOKEN) throw new Error('Missing Shopify configurations in environment variables');

const shopifyApi = axios.create({
	baseURL: SHOPIFY_API_BASE_URL,
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
const getCustomerTags = async (customerId: number): Promise<string[]> => {
	const query = `
		query getCustomer($id: ID!) {
			customer(id: $id) { tags }
		}
	`;

	const variables = {
		id: `gid://shopify/Customer/${customerId}`
	};

	const response = await shopifyApi.post('/', { query, variables });
	const customer = response.data?.data?.customer;
	if (!customer) throw new Error('Customer not found');

	return customer.tags || [];
};

const addCustomerTags = async (customerId: number, tags: string[]): Promise<void> => {
	const existingTags = await getCustomerTags(customerId);

	const mergedTags = Array.from(new Set([...existingTags, ...tags]));

	const mutation = `
		mutation customerSet($id: ID!, $input: CustomerInput!) {
			customerSet(id: $id, input: $input) {
				customer { id tags }
				userErrors { field message }
			}
		}
	`;

	const variables = {
		id: `gid://shopify/Customer/${customerId}`,
		input: { mergedTags }
	};

	const response = await shopifyApi.post('/', { query: mutation, variables });

	const errors = response.data?.data?.customerSet?.userErrors;
	if (errors?.length) throw new Error(`Error when adding Shopify customer tags: ${JSON.stringify(errors)}`);
}

export const shopifyClient = {
	customers: {
		getTags: getCustomerTags,
		addTags: addCustomerTags
	}
}
