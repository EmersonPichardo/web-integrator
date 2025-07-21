import { fileManager } from "../../../../files/filesManagers";
import { shopifyClient } from "../../../shopify/shopifyClient";
import { sparklayerClient } from "../../../sparklayer/sparklayerClient";
import { SparklayerNewCustomerRequest, SparklayerNewPriceListRequest } from "../../../sparklayer/sparklayerClient.types";
import { airtableClient } from "../../client/airtableClient";
import { AirtableTicketStatus } from "../../client/airtableClient.types";

export const priceListUploadedWebhookHandler = async (data: any): Promise<void> => {
	var customer = data.customer;

	//Reading file from the webhook data
	const file = data.file;
	if (!file) throw new Error("Price list file is missing or invalid.");

	// Assuming the file is a CSV and reading its content
	const priceListDetails = fileManager.csv.getContent(file);
	if (!priceListDetails) throw new Error("Price list details are missing or invalid.");

	// Creating a new price list in Sparklayer
	const sparklayerNewPriceListRequest: SparklayerNewPriceListRequest = {
		name: customer.name,
		prices: priceListDetails.data.map((item) => ({
			product_id: item[0], // Assuming the first column is product ID
			price: item[1], // Assuming the second column is the price
		}))
	};
	await sparklayerClient.priceList.create(sparklayerNewPriceListRequest);

	// Creating a new customer in Sparklayer (including the customer group)
	const sparklayerNewCustomerRequest: SparklayerNewCustomerRequest = {
		name: customer.name,
		email: customer.email
	};
	var sparklayerNewCustomerResponse = await sparklayerClient.customers.create(sparklayerNewCustomerRequest);

	// Adding the customer group name as a tag to the customer in Shopify
	await shopifyClient.customers.addTags(customer.id, [sparklayerNewCustomerResponse.group]);

	// Updating the Airtable ticket status to completed
	await airtableClient.tickets.updateStatus(data.ticketId, AirtableTicketStatus.Completed);
}