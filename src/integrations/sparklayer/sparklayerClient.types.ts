// Tokens
export interface SparklayerLocalSession {
	accessToken: string;
	expiresAt: Date;
}
export interface SparklayerTokenResponse {
	access_token: string;
	expires_in: number;
}

// Price Lists
export interface SparklayerNewPriceListRequest {
	name: string;
	prices?: any[];
}
export interface SparklayerNewPriceListResponse {
	id: string;
	slug: string;
}

// Customers
export interface SparklayerNewCustomerRequest {
	name: string;
	email: string;
}
export interface SparklayerNewCustomerResponse {
	id: string;
	group: string;
}
