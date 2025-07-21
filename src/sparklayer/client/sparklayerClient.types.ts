//Tokens
export interface SparklayerLocalSession {
	accessToken: string;
	expiresAt: Date;
}
export interface SparklayerTokenResponse {
	access_token: string;
	expires_in: number;
}

//Price Lists
export interface SparklayerNewPriceListRequest {
	name: string;
	currency_code: string;
	prices?: any[];
}
export interface SparklayerNewPriceListResponse {
	slug: string;
}

//Customers
export interface SparklayerNewCustomerRequest {
	name: string;
	email: string;
	group?: string;
}
export interface SparklayerNewCustomerResponse {
	id: string;
	name: string;
	email: string;
	group?: string;
}
