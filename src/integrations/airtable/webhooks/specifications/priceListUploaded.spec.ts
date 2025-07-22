import { WebhookSpecification } from "./webhookSpecification";

const priceListUploadedWebhookSpecification: WebhookSpecification = {
	options: {
		filters: {
			dataTypes: ["tableData"],
			recordChangeScope: "tblvUIsjcW3gMnigw",
			watchDataInFieldIds: ["fldHFdP023fNaaA6u"],
			changeTypes: ["add", "update"]
		},
		includes: {
			includeCellValuesInFieldIds: ["fldreJTMOYADTlAtg", "flddDdlLvrBhM3jDQ", "fldhtKnjqk8bD4SCI"]
		}
	}
}

export default priceListUploadedWebhookSpecification;