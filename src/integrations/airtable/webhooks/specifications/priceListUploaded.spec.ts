import { WebhookSpecification } from "./webhookSpecification";

const priceListUploadedWebhookSpecification: WebhookSpecification = {
	options: {
		filters: {
			dataTypes: ["tableData"],
			recordChangeScope: "{table-id}",
			watchDataInFieldIds: ["{attament-column-id}"],
			changeTypes: ["add"],
		},
		includes: {
			includeCellValuesInFieldIds: ["{id-column-id}", "{customer-name-column-id}", "{customer-email-column-id}"],
		}
	}
}

export default priceListUploadedWebhookSpecification;