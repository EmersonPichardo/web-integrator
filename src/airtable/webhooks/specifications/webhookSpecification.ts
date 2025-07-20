export interface WebhookSpecification {
	options: {
		filters?: {
			recordChangeScope?: string;
			dataTypes: Array<"tableData" | "tableFields" | "tableMetadata">;
			changeTypes?: Array<"add" | "remove" | "update">;
			fromSources?: Array<"client" | "publicApi" | "formSubmission" | "formPageSubmission" | "automation" | "system" | "sync" | "anonymousUser" | "unknown">;
			sourceOptions?: {
				formPageSubmission?: {
					pageId?: string;
				};
				formSubmission?: {
					viewId?: string;
				};
			};
			watchDataInFieldIds?: string[];
			watchSchemasOfFieldIds?: string[];
		};
		includes?: {
			includeCellValuesInFieldIds?: string[] | "all";
			includePreviousCellValues?: boolean;
			includePreviousFieldDefinitions?: boolean;
		};
	};
};