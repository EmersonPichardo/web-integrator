import axios from "axios";
import { CsvContent, FileDetails } from "./fileManagers.types";
import Papa from "papaparse";

const getCsvContent = async (file: FileDetails): Promise<CsvContent> => {
	const response = await axios.get(file.url, { responseType: 'text' });

	const parsedFile = Papa.parse<string[]>(response.data, {
		skipEmptyLines: true,
	});

	// Skip the first row (headers)
	const rows = parsedFile.data.slice(1);

	const csvData: CsvContent = {
		data: rows.map(row =>
			row.map(cell => {
				const normalizeCell = cell.trim();

				if (!normalizeCell) return null;
				if (!isNaN(Number(normalizeCell))) return Number(normalizeCell);

				return normalizeCell;
			})
		),
	};

	return csvData;
};

export const fileManager = {
	csv: {
		getContent: getCsvContent
	}
};