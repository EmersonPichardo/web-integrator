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
	priceList: SparklayerPriceDetail[];
}
export interface SparklayerPriceDetail {
	sku: string;
	quantity: number;
	price: number;
}
