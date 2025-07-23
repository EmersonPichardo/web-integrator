import axios, { InternalAxiosRequestConfig } from 'axios';
import dotenv from 'dotenv';
import { SparklayerLocalSession, SparklayerNewPriceListRequest, SparklayerPriceDetail, SparklayerTokenResponse } from './sparklayerClient.types';
dotenv.config();

const SPARKLAYER_API_BASE_URL = process.env.SPARKLAYER_API_BASE_URL?.replace(/\/$/, ''); // remove trailing slash;
const SPARKLAYER_SITE_ID = process.env.SPARKLAYER_SITE_ID;
const SPARKLAYER_CLIENT_ID = process.env.SPARKLAYER_CLIENT_ID;
const SPARKLAYER_CLIENT_SECRET = process.env.SPARKLAYER_CLIENT_SECRET;
if (!SPARKLAYER_API_BASE_URL || !SPARKLAYER_SITE_ID || !SPARKLAYER_CLIENT_ID || !SPARKLAYER_CLIENT_SECRET)
	throw new Error('Missing Sparklayer configurations in environment variables');

let session: SparklayerLocalSession;

const sparklayerApi = axios.create({
	baseURL: `${SPARKLAYER_API_BASE_URL}/v1`,
	headers: {
		'Site-Id': SPARKLAYER_SITE_ID,
		'Content-Type': 'application/json'
	}
});

sparklayerApi.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
	if (config.url?.includes('/auth/token')) return config; // Skip authentication for token endpoint

	await ensureAuthentication();
	config.headers['Authorization'] = `Bearer ${session!.accessToken}`;
	return config;
});

const ensureAuthentication = async () => {
	if ((session?.expiresAt?.getTime() - (60_000 * 5)) > Date.now()) return; // Refresh token if it expires in less than 5 minutes

	const response = await sparklayerApi.post<SparklayerTokenResponse>(`${SPARKLAYER_API_BASE_URL}/auth/token`, {
		grant_type: 'client_credentials',
		client_id: SPARKLAYER_CLIENT_ID,
		client_secret: SPARKLAYER_CLIENT_SECRET
	});

	session = {
		accessToken: response.data.access_token,
		expiresAt: new Date(Date.now() + response.data.expires_in * 1000)
	}
};

sparklayerApi.interceptors.response.use(
	response => response,
	error => {
		console.error('SparkLayer API Error:', error.response?.data || error.message);
		return Promise.reject(error);
	}
);

// Price Lists management
const createPriceList = async ({ name, priceList }: SparklayerNewPriceListRequest): Promise<void> => {
	const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
	const existingPriceList = await sparklayerApi.get(`/price-lists/${slug}`, { validateStatus: () => true });

	if (existingPriceList?.data?.slug) {
		await sparklayerApi.patch(`/price-lists/${slug}`, { name });
	} else {
		await sparklayerApi.post('/price-lists', { slug, name, currency_code: 'USD', source: 'integration' });
	}

	const priceListGroupedBySku = groupPriceListBySku(priceList);

	const skuUpdatePromises = Object.entries(priceListGroupedBySku).map(([sku, priceDetail]) => sparklayerApi.patch(`/pricing/${sku}`, [{
		price_list_slug: slug,
		pricing: priceDetail.map(detail => ({ quantity: detail.quantity, price: detail.price }))
	}]));

	const skuUpdateResults = await Promise.allSettled(skuUpdatePromises);

	skuUpdateResults.forEach((result, index) => {
		if (result.status === 'rejected') {
			console.warn(`Failed to update SKU at index ${index}:`, result.reason?.response?.data || result.reason?.message);
		}
	});
}
const groupPriceListBySku = (priceList: SparklayerPriceDetail[]): Record<string, SparklayerPriceDetail[]> => {
	const priceListGroupedBySku: Record<string, SparklayerPriceDetail[]> = {};

	for (const entry of priceList) {
		if (!priceListGroupedBySku[entry.sku]) priceListGroupedBySku[entry.sku] = [];

		priceListGroupedBySku[entry.sku].push({
			sku: entry.sku,
			quantity: entry.quantity,
			price: entry.price
		});
	}

	return priceListGroupedBySku;
}

// Customers management
const createCustomer = async (name: string): Promise<string> => {
	const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
	const customerGroups = await sparklayerApi.get('/customer-groups');
	const existingCustomerChild = customerGroups?.data?.find((group: any) => group.slug === slug);

	if (existingCustomerChild) {
		await sparklayerApi.patch(`/customer-groups/${slug}`, { name });
	} else {
		await sparklayerApi.post('/customer-groups', { slug, name });
	}

	return `b2b-${slug}`;
}

export const sparklayerClient = {
	priceList: {
		create: createPriceList
	},
	customers: {
		create: createCustomer
	}
}
