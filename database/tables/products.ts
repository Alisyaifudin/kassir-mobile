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
		try {
			const products = await this.#db.getAllAsync<DB.Product>("SELECT * FROM products");
			this.#caches.all = products;
			return ok(products);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async getById(
		id: number
	): Promise<Result<"Aplikasi bermasalah" | "Barang tidak ada", DB.Product>> {
		try {
			const product = await this.#db.getFirstAsync<DB.Product>(
				"SELECT * FROM products WHERE id = ?",
				id
			);
			if (product === null) return err("Barang tidak ada");
			return ok(product);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
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
			try {
				const product = await this.#db.getFirstAsync<{ name: string }>(
					"SELECT name FROM products WHERE barcode = ?",
					data.barcode.trim()
				);
				if (product !== null) {
					return "Barang sudah ada";
				}
			} catch (error) {
				console.error(error);
				return "Aplikasi bermasalah";
			}
		}
		try {
			await this.#db.runAsync(
				`INSERT INTO products (name, stock, price, barcode, capital, note) 
			 VALUES ($1, $2, $3, $4, $5, $6)`,
				{
					$1: data.name.trim(),
					$2: data.stock,
					$3: data.price,
					$4: data.barcode === null ? null : data.barcode.trim(),
					$5: data.capital,
					$6: data.note,
				}
			);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
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
			try {
				const product = await this.#db.getFirstAsync<{ name: string }>(
					"SELECT name FROM products WHERE barcode = ?",
					data.barcode.trim()
				);
				if (product !== null) {
					return "Barang sudah ada";
				}
			} catch (error) {
				console.error(error);
				return "Aplikasi bermasalah";
			}
		}
		try {
			await this.#db.runAsync(
				`UPDATE products SET name = $name, stock = $stock, price = $price, 
			 barcode = $barcode, capital = $capital, note = $note 
			 WHERE id = $id`,
				{
					$name: data.name.trim(),
					$stock: data.stock,
					$price: data.price,
					$barcode: data.barcode === null ? null : data.barcode.trim(),
					$capital: data.capital,
					$note: data.note,
					$id: id,
				}
			);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
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
