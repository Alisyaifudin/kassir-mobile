/* eslint-disable no-var */
import { err, ok, Result } from "@/lib/utils";
import { type SQLiteDatabase } from "expo-sqlite";

export class ProductTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	#caches = {
		all: null as DB.Product[] | null,
	};
	revalidate(key: "all") {
		this.#caches[key] = null;
	}
	async getAll(): Promise<Result<"Aplikasi bermasalah", DB.Product[]>> {
		if (this.#caches.all !== null) {
			return ok(this.#caches.all);
		}
		const statement = await this.#db.prepareAsync("SELECT * FROM products");
		try {
			var res = await statement.executeAsync<DB.Product>();
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		} finally {
			await statement.finalizeAsync();
		}
		const products = await res.getAllAsync();
		this.#caches.all = products;
		return ok(products);
	}
	async insert(data: {
		name: string;
		price: number;
		stock: number;
		capital: number;
		barcode: string | null;
		note: string;
	}): Promise<"Aplikasi bermasalah" | "Barang sudah ada" | null> {
		if (data.barcode !== null) {
			const selectStmt = await this.#db.prepareAsync(
				"SELECT name FROM products WHERE barcode = $barcode"
			);
			try {
				var selectRes = await selectStmt.executeAsync<Pick<DB.Product, "name">>({
					$barcode: data.barcode,
				});
			} catch (error) {
				console.error(error);
				return "Aplikasi bermasalah";
			} finally {
				await selectStmt.finalizeAsync();
			}
			const prod = await selectRes.getFirstAsync();
			if (prod === null) {
				return "Barang sudah ada";
			}
		}
		const insertStmt = await this.#db.prepareAsync(
			`INSERT INTO products (name, stock, price, barcode, capital, note) 
			 VALUES ($1, $2, $3, $4, $5, $6)`
		);
		try {
			await insertStmt.executeAsync({
				$1: data.name.trim(),
				$2: data.stock,
				$3: data.price,
				$4: data.barcode === null ? null : data.barcode.trim(),
				$5: data.capital,
				$6: data.note,
			});
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		} finally {
			await insertStmt.finalizeAsync();
		}
		return null;
	}
}
