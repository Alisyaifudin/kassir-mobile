import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { err, ok, Result } from "./utils";

export async function downloadCSV(
	csv: string,
	filename: string
): Promise<Result<"Aplikasi bermasalah" | "Tidak bisa untuk versi ini", "Berhasil disimpan">> {
	try {
		const csvFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
		const fileUri = FileSystem.documentDirectory + csvFilename;
		await FileSystem.writeAsStringAsync(fileUri, csv, {
			encoding: FileSystem.EncodingType.UTF8,
		});
		if (await Sharing.isAvailableAsync()) {
			await Sharing.shareAsync(fileUri, {
				mimeType: "text/csv",
				dialogTitle: "Save CSV File",
				UTI: "public.comma-separated-values-text", // For better iOS compatibility
			});

			return ok("Berhasil disimpan");
		} else {
			return err("Tidak bisa untuk versi ini");
		}
	} catch (error) {
		console.error("Error downloading CSV:", error);
		return err("Aplikasi bermasalah");
	}
}

export async function downloadZip(
	csv: string,
	filename: string
): Promise<Result<"Aplikasi bermasalah" | "Tidak bisa untuk versi ini", "Berhasil disimpan">> {
	try {
		const csvFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
		const fileUri = FileSystem.documentDirectory + csvFilename;
		await FileSystem.writeAsStringAsync(fileUri, csv, {
			encoding: FileSystem.EncodingType.UTF8,
		});
		if (await Sharing.isAvailableAsync()) {
			await Sharing.shareAsync(fileUri, {
				mimeType: "text/csv",
				dialogTitle: "Save CSV File",
				UTI: "public.comma-separated-values-text", // For better iOS compatibility
			});

			return ok("Berhasil disimpan");
		} else {
			return err("Tidak bisa untuk versi ini");
		}
	} catch (error) {
		console.error("Error downloading CSV:", error);
		return err("Aplikasi bermasalah");
	}
}

// export async function downloadCSV(
// 	csv: string,
// 	filename: string
// ): Promise<
// 	Result<
// 		| "Aplikasi bermasalah"
// 		| "Tidak bisa mengunduh dengan versi ini"
// 		| "Hanya bisa di ios atau android",
// 		"Berhasil disimpan"
// 	>
// > {
// 	// Ensure filename has .csv extension
// 	const csvFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;

// 	switch (Platform.OS) {
// 		case "android": {
// 			const permissions = await MediaLibrary.requestPermissionsAsync();
// 			if (permissions.status === "granted") {
// 				const cacheFileUri = FileSystem.cacheDirectory + csvFilename;
// 				try {
// 					await FileSystem.writeAsStringAsync(cacheFileUri, csv, {
// 						encoding: FileSystem.EncodingType.UTF8,
// 					});
// 					const fileInfo = await FileSystem.getInfoAsync(cacheFileUri);
// 					if (!fileInfo.exists) {
// 						console.error("File was not created successfully");
// 						return err("Aplikasi bermasalah");
// 					}
// 				} catch (error) {
// 					console.error(error);
// 					return err("Aplikasi bermasalah");
// 				}
// 				const asset = await MediaLibrary.createAssetAsync(cacheFileUri);
// 				try {
// 					const album = await MediaLibrary.getAlbumAsync("Download");
// 					if (album == null) {
// 						await MediaLibrary.createAlbumAsync("Download", asset, false);
// 					} else {
// 						await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
// 					}

// 					// Clean up cache file
// 					await FileSystem.deleteAsync(cacheFileUri, { idempotent: true });

// 					return ok("Berhasil disimpan");
// 				} catch (albumError) {
// 					console.warn("Could not save to Downloads album, file saved to gallery:", albumError);
// 					return ok("Berhasil disimpan");
// 				}
// 			} else {
// 				console.error("Storage permission denied");
// 				return err("Aplikasi bermasalah");
// 			}
// 		}
// 		case "ios": {
// 			// For iOS, use sharing (most reliable approach)
// 			const fileUri = FileSystem.documentDirectory + csvFilename;

// 			await FileSystem.writeAsStringAsync(fileUri, csv, {
// 				encoding: FileSystem.EncodingType.UTF8,
// 			});

// 			if (await Sharing.isAvailableAsync()) {
// 				await Sharing.shareAsync(fileUri, {
// 					mimeType: "text/csv",
// 					dialogTitle: "Save CSV File",
// 				});
// 				return ok("Berhasil disimpan");
// 			} else {
// 				return err("Tidak bisa mengunduh dengan versi ini");
// 			}
// 		}
// 		default:
// 			const errMsg = "Hanya bisa di ios atau android";
// 			console.error(errMsg);
// 			return err(errMsg);
// 	}
// }

export function constructCSV<T extends Record<string, any>>(
	data: T[]
): Result<"Aplikasi bermasalah" | "Data kosong", string> {
	if (data.length === 0) return err("Data kosong");
	try {
		const headers = Object.keys(data[0]) as (keyof T)[];
		const delimiter = ",";
		const lineBreak = "\n";

		// Escape CSV special characters (commas, quotes, newlines)
		const escapeCSV = (value: unknown): string => {
			if (value === null || value === undefined) return "";
			const str = String(value);
			if (str.includes(delimiter) || str.includes('"') || str.includes(lineBreak)) {
				return `"${str.replace(/"/g, '""')}"`;
			}
			return str;
		};

		const lines: string[] = [];

		// Add header row
		lines.push(headers.map((header) => escapeCSV(header)).join(delimiter));

		// Add data rows
		for (const item of data) {
			const row = headers.map((header) => escapeCSV(item[header]));
			lines.push(row.join(delimiter));
		}

		return ok(lines.join(lineBreak));
	} catch (error) {
		console.error(error);
		return err("Aplikasi bermasalah");
	}
}
