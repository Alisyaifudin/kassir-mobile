import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { err, ok, Result } from "./utils";

export namespace image {
	// export async function deleteAll() {
	// 	await FileSystem.deleteAsync(`${FileSystem.documentDirectory}product_images/`);
	// 	return null;
	// }
	async function ensureDirExists() {
		const dir = `${FileSystem.documentDirectory}product_images/`;
		const dirInfo = await FileSystem.getInfoAsync(dir);
		if (!dirInfo.exists) {
			await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
		}
		return dir;
	}
	export async function pick(): Promise<
		Result<
			"Tidak diizinkan" | "Operasi dibatalkan",
			{
				uri: string;
				name: string;
				width: number;
				height: number;
			}
		>
	> {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== ImagePicker.PermissionStatus.GRANTED) {
			return err("Tidak diizinkan");
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			quality: 0.7,
		});
		if (result.canceled) {
			return err("Operasi dibatalkan");
		}
		return ok({
			uri: result.assets[0].uri,
			name: result.assets[0].fileName ?? "image",
			width: result.assets[0].width,
			height: result.assets[0].height,
		});
	}
	export async function save(
		uri: string,
		name: string
	): Promise<Result<"Aplikasi bermasalah", string>> {
		const dir = await ensureDirExists();
		const newPath = `${dir}${Date.now()}_${name}`;
		try {
			await FileSystem.copyAsync({
				from: uri,
				to: newPath,
			});
			return ok(newPath);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	export async function del(uri: string): Promise<"Aplikasi bermasalah" | null> {
		try {
			await FileSystem.deleteAsync(uri);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	export async function deleleMany(uris: string[]): Promise<"Aplikasi bermasalah" | null> {
		const promises = [];
		for (const uri of uris) {
			promises.push(FileSystem.deleteAsync(uri));
		}
		try {
			await Promise.all(promises);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
}
