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
			const res = await statement.executeAsync<DB.Product>();
			var products = await res.getAllAsync();
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		} finally {
			await statement.finalizeAsync();
		}
		this.#caches.all = products;
		return ok(products);
	}
	async getById(
		id: number
	): Promise<Result<"Aplikasi bermasalah" | "Barang tidak ada", DB.Product>> {
		const statement = await this.#db.prepareAsync("SELECT * FROM products WHERE id = $id");
		try {
			const res = await statement.executeAsync<DB.Product>({ $id: id });
			var products = await res.getAllAsync();
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		} finally {
			await statement.finalizeAsync();
		}
		if (products.length === 0) return err("Barang tidak ada");
		return ok(products[0]);
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
				const selectRes = await selectStmt.executeAsync<Pick<DB.Product, "name">>({
					$barcode: data.barcode,
				});
				var prod = await selectRes.getFirstAsync();
			} catch (error) {
				console.error(error);
				return "Aplikasi bermasalah";
			} finally {
				await selectStmt.finalizeAsync();
			}
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
	async edit(
		id: number,
		data: {
			name: string;
			price: number;
			stock: number;
			capital: number;
			barcode: string | null;
			note: string;
		}
	): Promise<"Aplikasi bermasalah" | "Barang sudah ada" | null> {
		if (data.barcode !== null) {
			const selectStmt = await this.#db.prepareAsync(
				"SELECT name FROM products WHERE barcode = $barcode"
			);
			try {
				const selectRes = await selectStmt.executeAsync<Pick<DB.Product, "name">>({
					$barcode: data.barcode,
				});
				var prod = await selectRes.getFirstAsync();
			} catch (error) {
				console.error(error);
				return "Aplikasi bermasalah";
			} finally {
				await selectStmt.finalizeAsync();
			}
			if (prod === null) {
				return "Barang sudah ada";
			}
		}
		const editStmt = await this.#db.prepareAsync(
			`UPDATE products SET name = $name, stock = $stock, price = $price, 
			 barcode = $barcode, capital = $capital, note = $note 
			 WHERE id = $id`
		);
		try {
			await editStmt.executeAsync({
				$name: data.name.trim(),
				$stock: data.stock,
				$price: data.price,
				$barcode: data.barcode === null ? null : data.barcode.trim(),
				$capital: data.capital,
				$note: data.note,
				$id: id,
			});
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		} finally {
			await editStmt.finalizeAsync();
		}
		return null;
	}
	async delete(id: number): Promise<"Aplikasi bermasalah" | null> {
		const statement = await this.#db.prepareAsync("DELETE FROM products WHERE id = $id");
		try {
			await statement.executeAsync<DB.Product>({ $id: id });
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		} finally {
			await statement.finalizeAsync();
		}
		return null;
	}
}
