import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const SPARKLAYER_BASE_URL = process.env.SPARKLAYER_BASE_URL?.replace(/\/$/, ''); // remove trailing slash;
const SPARKLAYER_API_KEY = process.env.SPARKLAYER_API_KEY;
const SPARKLAYER_SITE_ID = process.env.SPARKLAYER_SITE_ID;
if (!SPARKLAYER_BASE_URL || !SPARKLAYER_API_KEY || !SPARKLAYER_SITE_ID) throw new Error('Missing Sparklayer configurations in environment variables');

interface PriceList {
	slug: string;
	name: string;
	currency_code: string;
	rules?: any[];
}
interface Customer {
	id: string;
	name: string;
	email: string;
	group?: string;
}
interface PriceListInput {
	name: string;
	currency_code: string;
	rules?: any[];
}
interface PriceListResponse {
	slug: string;
	name: string;
	currency_code: string;
}
interface CustomerInput {
	name: string;
	email: string;
	group?: string;
}
interface CustomerResponse {
	id: string;
	name: string;
	email: string;
	group?: string;
}
interface CustomerGroupResponse {
	id: string;
	name: string;
}

// Token store
let accessToken: string | null = null;
let tokenExpiry = 0;

async function authenticate(api: AxiosInstance) {
	if (accessToken && Date.now() < tokenExpiry) return;

	const authRes = await api.post('/api/auth/token', {
		grant_type: 'client_credentials',
		client_id: process.env.SPARKLAYER_CLIENT_ID,
		client_secret: process.env.SPARKLAYER_CLIENT_SECRET
	});
	accessToken = authRes.data.access_token;
	tokenExpiry = Date.now() + authRes.data.expires_in * 1000;
}

class SparkLayerClient {
	private api: AxiosInstance;

	constructor() {
		this.api = axios.create({
			baseURL: process.env.SPARKLAYER_BASE_URL,
			headers: { 'X-Site-Id': process.env.SPARKLAYER_SITE_ID }
		});
	}

	private async request<T>(fn: () => Promise<any>): Promise<T> {
		await authenticate(this.api);
		this.api.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
		const res = await fn();
		return res.data as T;
	}

	async createPriceList(pl: PriceListInput): Promise<PriceListResponse> {
		return this.request(() => this.api.post('/price-lists', pl));
	}

	async updatePricing(slug: string, prices: any[]): Promise<void> {
		await this.request(() =>
			this.api.put(`/price-lists/${slug}/prices`, { prices })
		);
	}

	async createCustomer(c: CustomerInput): Promise<CustomerResponse> {
		return this.request(() => this.api.post('/customers', c));
	}

	async newCustomerGroup(name: string): Promise<CustomerGroupResponse> {
		return this.request(() => this.api.post('/customer-groups', { name }));
	}
}

export default new SparkLayerClient();
