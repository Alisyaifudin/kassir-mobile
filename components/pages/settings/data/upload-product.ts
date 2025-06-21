import { err, numeric, ok, Result } from "@/lib/utils";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { z } from "zod";

export async function uploadProduct(): Promise<Result<"Aplikasi bermasalah", string>> {
	try {
		// Open document picker with CSV filter
		const result = await DocumentPicker.getDocumentAsync({
			type: [
				"text/csv",
				"application/csv",
				"text/comma-separated-values",
				"application/vnd.ms-excel",
			],
			copyToCacheDirectory: true,
			multiple: false,
		});

		// Check if user cancelled the selection
		if (result.canceled) {
			throw new Error("File selection was cancelled");
		}

		// Get the selected file
		const file = result.assets[0];

		if (!file) {
			throw new Error("No file selected");
		}

		// Read the file content
		const fileContent = await FileSystem.readAsStringAsync(file.uri, {
			encoding: FileSystem.EncodingType.UTF8,
		});

		return ok(fileContent);
	} catch (error) {
		console.error("Error uploading product file:", error);
		return err("Aplikasi bermasalah");
	}
}

export function validate(text: string): Result<"Aplikasi bermasalah", DB.Product[]> {
	if (text === "") {
		console.error("file is empty");
		return err("Aplikasi bermasalah");
	}
	const lines = text.split("\n");
	if (lines.length === 0) {
		console.error("no lines");
		return err("Aplikasi bermasalah");
	}
	if (lines.length === 1) {
		console.error("only one line");
		return err("Aplikasi bermasalah");
	}
	const header = lines[0].split(",");
	if (header.length !== 7) {
		console.error("Malformed header 1: ", header);
		return err("Aplikasi bermasalah");
	}
	if (
		header[0].trim() !== "id" ||
		header[1].trim() !== "name" ||
		header[2].trim() !== "price" ||
		header[3].trim() !== "stock" ||
		header[4].trim() !== "barcode" ||
		header[5].trim() !== "capital" ||
		header[6].trim() !== "note"
	) {
		return err("Aplikasi bermasalah");
	}
	let i = 0;
	const items: DB.Product[] = [];
	for (const line of lines) {
		if (i === 0) {
			i++;
			continue;
		}
		const chunk = line.split(",");
		if (chunk.length !== 7) {
			console.log(`Malformed line number of chunk ${i}: ${chunk}`);
			return err("Aplikasi bermasalah");
		}
		const parsed = z
			.object({
				id: numeric,
				name: z.string(),
				price: numeric,
				stock: numeric,
				barcode: z.string().transform((v) => v || null),
				capital: numeric,
				note: z.string(),
			})
			.safeParse({
				id: chunk[0],
				name: chunk[1],
				price: chunk[2],
				stock: chunk[3],
				barcode: chunk[4],
				capital: chunk[5],
				note: chunk[6],
			});
		if (!parsed.success) {
			console.log(`Malformed line number of chunk ${i}:\n${parsed.error}`);
			return err("Aplikasi bermasalah");
		}
		items.push(parsed.data);
		i++;
	}
	return ok(items);
}
