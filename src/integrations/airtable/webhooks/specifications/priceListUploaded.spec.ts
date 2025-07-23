import { WebhookSpecification } from "./webhookSpecification";

export enum PriceListUploadedEntities {
	'Customers' = 'tblvUIsjcW3gMnigw',
	'Status' = 'fld7wEQHIAwCcx49e',
	'Uploaded Price Sheet File' = 'fldHFdP023fNaaA6u',
	'Customer ID' = 'fldreJTMOYADTlAtg',
	'Customer Email' = 'flddDdlLvrBhM3jDQ',
	'Company Name' = 'fldhtKnjqk8bD4SCI'
}

export const priceListUploadedWebhookSpecification: WebhookSpecification = {
	options: {
		filters: {
			dataTypes: ['tableData'],
			recordChangeScope: PriceListUploadedEntities.Customers,
			watchDataInFieldIds: [PriceListUploadedEntities['Status']],
			changeTypes: ['update']
		},
		includes: {
			includeCellValuesInFieldIds: [
				PriceListUploadedEntities["Customer ID"],
				PriceListUploadedEntities["Customer Email"],
				PriceListUploadedEntities["Company Name"],
				PriceListUploadedEntities['Uploaded Price Sheet File']
			]
		}
	}
}