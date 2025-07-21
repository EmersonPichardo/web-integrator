import { CsvContent } from "./fileManagers.types";

const getCsvContent = (file: any): CsvContent => {
	return {
		data: []
	}
};

export const fileManager = {
	csv: {
		getContent: getCsvContent
	}
};