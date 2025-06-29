import * as SecureStore from "expo-secure-store";
import { err, ok, Result } from "./utils";

export const storeKeys = ["name", "address", "header", "footer", "showCashier"] as const;
export type StoreKey = (typeof storeKeys)[number];
export type Profile = {
	[K in StoreKey]: string;
};

export const store = {
	async get(): Promise<Result<"Aplikasi bermasalah", Profile>> {
		try {
			const all = await Promise.all(storeKeys.map((k) => SecureStore.getItemAsync(k)));
			const info = storeKeys.map((key, i) => {
				if (all[i] === null) return [key, ""] as [StoreKey, string];
				return [key, all[i]] as [StoreKey, string];
			});
			return ok(Object.fromEntries(info) as Profile);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	},
	async set(data: Profile): Promise<"Aplikasi bermasalah" | null> {
		try {
			await Promise.all(storeKeys.map((key) => SecureStore.setItemAsync(key, data[key])));
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	},
};
