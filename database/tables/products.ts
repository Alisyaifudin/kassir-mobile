import { err, ok, Result } from "@/lib/utils";
import { SQLiteRunResult, type SQLiteDatabase } from "expo-sqlite";

export type Product = DB.Product & {
	capitals: {
		value: number;
		id: number;
		stock: number;
	}[];
};

export class ProductTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	#caches = {
		all: null as Product[] | null,
	};
	revalidate(key: "all") {
		this.#caches[key] = null;
	}
	async getAll(): Promise<Result<"Aplikasi bermasalah", Product[]>> {
		if (this.#caches.all !== null) {
			return ok(this.#caches.all);
		}
		try {
			const res = await this.#db.getAllAsync<
				DB.Product & { capital_id: number; capital: number; stock: number }
			>(
				`SELECT products.id, products.name, products.price, products.barcode, products.note,
				        product_capitals.id AS capital_id, product_capitals.value AS capital, product_capitals.stock AS stock
				 FROM products INNER JOIN capitals ON products.id = product_capitals.product_id`
			);
			const products = collectProducts(res);
			this.#caches.all = products;
			return ok(products);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async getById(id: number): Promise<Result<"Aplikasi bermasalah" | "Barang tidak ada", Product>> {
		try {
			const res = await this.#db.getAllAsync<
				DB.Product & { capital_id: number; capital: number; stock: number }
			>(
				`SELECT products.id, products.name, products.price, products.barcode, products.note,
				        product_capitals.id AS capital_id, product_capitals.value AS capital, product_capitals.stock AS stock
				 FROM products INNER JOIN capitals ON products.id = product_capitals.product_id
				 WHERE product.id = ?`,
				id
			);
			if (res.length === 0) return err("Barang tidak ada");
			const product = collectProduct(res);
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
	}): Promise<Result<"Aplikasi bermasalah" | "Barang sudah ada", number>> {
		if (data.barcode !== null) {
			try {
				const product = await this.#db.getFirstAsync<{ name: string }>(
					"SELECT name FROM products WHERE barcode = ?",
					data.barcode.trim()
				);
				if (product !== null) {
					return err("Barang sudah ada");
				}
			} catch (error) {
				console.error(error);
				return err("Aplikasi bermasalah");
			}
		}
		try {
			const res = await this.#db.runAsync(
				`INSERT INTO products (name, price, barcode, note) 
			   VALUES ($name, $price, $barcode, $note)`,
				{
					$name: data.name.trim(),
					$price: data.price,
					$barcode: data.barcode === null ? null : data.barcode.trim(),
					$note: data.note,
				}
			);
			const capRes = await this.#db.runAsync(
				`INSERT INTO product_capitals (product_id, value, stock)
				 VALUES ($id, $capital, $stock)`,
				{
					$id: res.lastInsertRowId,
					$capital: data.capital,
					$stock: data.stock,
				}
			);
			if (this.#caches["all"] !== null) {
				this.#caches["all"].push({
					id: res.lastInsertRowId,
					name: data.name.trim(),
					barcode: data.barcode === null ? null : data.barcode.trim(),
					price: data.price,
					note: data.note,
					capitals: [
						{
							id: capRes.lastInsertRowId,
							stock: data.stock,
							value: data.capital,
						},
					],
				});
			}
			return ok(res.lastInsertRowId);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async edit(
		id: number,
		data: {
			name: string;
			price: number;
			barcode: string | null;
			note: string;
			capitals: [
				{
					id: number;
					stock: number;
					value: number;
				}
			];
		}
	): Promise<"Aplikasi bermasalah" | "Barang sudah ada" | null> {
		if (data.barcode !== null) {
			try {
				const product = await this.#db.getFirstAsync<{ id: number }>(
					"SELECT id FROM products WHERE barcode = ?",
					data.barcode.trim()
				);
				if (product !== null && product.id !== id) {
					return "Barang sudah ada";
				}
			} catch (error) {
				console.error(error);
				return "Aplikasi bermasalah";
			}
		}
		const promises: Promise<SQLiteRunResult>[] = [];
		try {
			promises.push(
				this.#db.runAsync(
					`UPDATE products SET name = $name, price = $price, 
			 barcode = $barcode, note = $note 
			 WHERE id = $id`,
					{
						$name: data.name.trim(),
						$price: data.price,
						$barcode: data.barcode === null ? null : data.barcode.trim(),
						$note: data.note,
						$id: id,
					}
				)
			);
			for (const cap of data.capitals) {
				this.#db.runAsync(`UPDATE product_capitals SET value = $value, stock = $stock WHERE id = $id`, {
					$value: cap.value,
					$id: cap.id,
					$stock: cap.stock,
				});
			}
			await Promise.all(promises);
			if (this.#caches["all"] !== null) {
				const itemIndex = this.#caches.all.findIndex((p) => p.id === id);
				if (itemIndex !== -1) {
					this.#caches.all[itemIndex] = {
						id: id,
						name: data.name.trim(),
						barcode: data.barcode === null ? null : data.barcode.trim(),
						price: data.price,
						capitals: data.capitals,
						note: data.note,
					};
				}
			}
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async delete(id: number): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync("DELETE FROM products WHERE id = ?", id);
			if (this.#caches.all !== null) {
				this.#caches.all = this.#caches.all.filter((p) => p.id !== id);
			}
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
}

function collectProducts(
	res: (DB.Product & {
		capital_id: number;
		capital: number;
		stock: number;
	})[]
) {
	const products: Product[] = [];
	for (const product of res) {
		const index = products.findIndex((p) => p.id === product.id);
		if (index === -1) {
			products.push({
				id: product.id,
				barcode: product.barcode,
				name: product.name,
				note: product.note,
				price: product.price,
				capitals: [
					{
						id: product.capital_id,
						stock: product.stock,
						value: product.capital,
					},
				],
			});
		} else {
			products[index].capitals.push({
				id: product.capital_id,
				stock: product.stock,
				value: product.capital,
			});
		}
	}
	return products;
}

function collectProduct(
	res: (DB.Product & {
		capital_id: number;
		capital: number;
		stock: number;
	})[]
) {
	let product: Product | null = null;
	for (const p of res) {
		if (product === null) {
			product = {
				id: p.id,
				barcode: p.barcode,
				name: p.name,
				note: p.note,
				price: p.price,
				capitals: [
					{
						id: p.capital_id,
						stock: p.stock,
						value: p.capital,
					},
				],
			};
		} else {
			product.capitals.push({
				id: p.capital_id,
				stock: p.stock,
				value: p.capital,
			});
		}
	}
	return product!;
}
