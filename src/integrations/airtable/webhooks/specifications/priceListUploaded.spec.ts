import { WebhookSpecification } from "./webhookSpecification";

const priceListUploadedWebhookSpecification: WebhookSpecification = {
	options: {
		filters: {
			dataTypes: ["tableData"],
			recordChangeScope: "{table-id}",
			watchDataInFieldIds: ["{attament-column-id}"],
			changeTypes: ["add"]
		}
	}
}

export default priceListUploadedWebhookSpecification;