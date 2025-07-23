import { fileManager } from "../../../../files/filesManagers";
import { shopifyClient } from "../../../shopify/shopifyClient";
import { sparklayerClient } from "../../../sparklayer/sparklayerClient";
import { SparklayerNewPriceListRequest, SparklayerPriceDetail } from "../../../sparklayer/sparklayerClient.types";
import { airtableClient } from "../../client/airtableClient";
import { AirtableCustomerStatus } from "../../client/airtableClient.types";
import { PriceListUploadedEntities } from "../specifications/priceListUploaded.spec";

export const priceListUploadedWebhookHandler = async (payload: any): Promise<void> => {
	var { recordId, status, customer, company, file } = getPriceListUploadedWebhookData(payload);

	if (status !== AirtableCustomerStatus.UploadPriceListAndCustomerGroup) return;
	if (!['emerson.pichardo@outlook.com', 'abelpena07@gmail.com'].includes(customer.email.toLowerCase())) return;

	// Assuming the file is a CSV and reading its content
	const priceListDetails = await fileManager.csv.getContent(file);

	// Creating a new price list in Sparklayer
	const sparklayerNewPriceListRequest: SparklayerNewPriceListRequest = {
		name: company.name,
		priceList: priceListDetails.data.map((item): SparklayerPriceDetail => ({
			sku: item[0] as string, // Assuming the first column is product ID
			quantity: item[1] as number, // Assuming the second column is quantity
			price: item[2] as number // Assuming the third column is the price
		}))
	};
	await sparklayerClient.priceList.create(sparklayerNewPriceListRequest);

	// Creating a new customer in Sparklayer (including the customer group)
	var sparklayerNewCustomerSlug = await sparklayerClient.customers.create(company.name);

	// Adding the customer group name as a tag to the customer in Shopify
	await shopifyClient.customers.addTags(customer.id, [sparklayerNewCustomerSlug]);

	// Updating the Airtable ticket status to completed
	await airtableClient.customers.updateStatus(recordId, AirtableCustomerStatus.ReviewSparklayer);
};

const getPriceListUploadedWebhookData = (payload: any): PriceListUploadedWebhookData => {
	const baseDataObject = payload.changedTablesById[PriceListUploadedEntities['Customers']].changedRecordsById;
	const recordId = Object.keys(baseDataObject)[0];
	const baseRecord = baseDataObject[recordId];
	const unchangedValueObject = baseRecord.unchanged.cellValuesByFieldId;
	const currentValueObject = baseRecord.current.cellValuesByFieldId[PriceListUploadedEntities['Status']];
	const fileAttachmentRecord = unchangedValueObject[PriceListUploadedEntities['Uploaded Price Sheet File']].valuesByLinkedRecordId;
	const fileAttachmentObject = (Object.values(fileAttachmentRecord)[0] as any[])[0];

	return {
		recordId,
		status: currentValueObject.name as AirtableCustomerStatus,
		customer: {
			id: unchangedValueObject[PriceListUploadedEntities['Customer ID']],
			email: unchangedValueObject[PriceListUploadedEntities['Customer Email']]
		},
		company: {
			name: unchangedValueObject[PriceListUploadedEntities['Company Name']]
		},
		file: {
			url: fileAttachmentObject.url
		}
	}
};

interface PriceListUploadedWebhookData {
	recordId: string;
	status: AirtableCustomerStatus;
	customer: { id: string; email: string; }
	company: { name: string; }
	file: { url: string; }
};