import axios, { InternalAxiosRequestConfig } from 'axios';
import dotenv from 'dotenv';
import { SparklayerLocalSession, SparklayerNewCustomerRequest, SparklayerNewCustomerResponse, SparklayerNewPriceListRequest, SparklayerNewPriceListResponse, SparklayerTokenResponse } from './sparklayerClient.types';
dotenv.config();

const SPARKLAYER_BASE_URL = process.env.SPARKLAYER_BASE_URL?.replace(/\/$/, ''); // remove trailing slash;
const SPARKLAYER_SITE_ID = process.env.SPARKLAYER_SITE_ID;
const SPARKLAYER_CLIENT_ID = process.env.SPARKLAYER_CLIENT_ID;
const SPARKLAYER_CLIENT_SECRET = process.env.SPARKLAYER_CLIENT_SECRET;
if (!SPARKLAYER_BASE_URL || !SPARKLAYER_SITE_ID || !SPARKLAYER_CLIENT_ID || !SPARKLAYER_CLIENT_SECRET)
	throw new Error('Missing Sparklayer configurations in environment variables');

let session: SparklayerLocalSession | null = null;

const sparkLayerApi = axios.create({
	baseURL: SPARKLAYER_BASE_URL,
	headers: {
		'Site-Id': SPARKLAYER_SITE_ID,
		'Content-Type': 'application/json'
	}
});

sparkLayerApi.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
	await ensureAuthentication();
	config.headers['Authorization'] = `Bearer ${session!.accessToken}`;
	return config;
});

const ensureAuthentication = async () => {
	if ((session!.expiresAt.getTime() - (60_000 * 5)) > Date.now()) return; // Refresh token if it expires in less than 5 minutes

	const response = await sparkLayerApi.post<SparklayerTokenResponse>('/auth/token', {
		grant_type: 'client_credentials',
		client_id: SPARKLAYER_CLIENT_ID,
		client_secret: SPARKLAYER_CLIENT_SECRET
	});

	session = {
		accessToken: response.data.access_token,
		expiresAt: new Date(Date.now() + response.data.expires_in * 1000)
	}
};

sparkLayerApi.interceptors.response.use(
	response => response,
	error => {
		console.error('Airtable API Error:', error.response?.data || error.message);
		return Promise.reject(error);
	}
);

// Price Lists management
const createPriceList = async ({ name, currency_code, prices }: SparklayerNewPriceListRequest): Promise<SparklayerNewPriceListResponse> => {
	const response = await sparkLayerApi.post<SparklayerNewPriceListResponse>('/price-lists', { name, currency_code });
	await sparkLayerApi.put(`/price-lists/${response.data.slug}/prices`, { prices });

	return response.data;
}

// Customers management
const createCustomer = async (customer: SparklayerNewCustomerRequest): Promise<SparklayerNewCustomerResponse> => {
	const response = await sparkLayerApi.post<SparklayerNewCustomerResponse>('/customers', customer);
	await sparkLayerApi.post('/customer-groups', { name: customer.group });
	return response.data;
}

export const sparkLayerClient = {
	priceList: {
		create: createPriceList
	},
	customers: {
		create: createCustomer
	}
}
