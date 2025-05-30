import { err, ok, Result } from "@/lib/utils";
import { type SQLiteDatabase } from "expo-sqlite";

export class RecordItemTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	async getByRange(
		start: number,
		end: number
	): Promise<Result<"Aplikasi bermasalah", DB.RecordItem[]>> {
		try {
			const res = await this.#db.getAllAsync<DB.RecordItem>(
				`SELECT * FROM record_items WHERE timestamp BETWEEN $start AND $end ORDER BY timestamp DESC`,
				{ $start: start, $end: end }
			);
			return ok(res);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async getAllByTime(timestamp: number): Promise<Result<"Aplikasi bermasalah", DB.RecordItem[]>> {
		try {
			const res = await this.#db.getAllAsync<DB.RecordItem>(
				`SELECT * FROM record_items WHERE timestamp = $timestamp ORDER BY timestamp DESC`,
				{ $timestamp: timestamp }
			);
			return ok(res);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async updateProductId(
		id: number,
		productId: number | null
	): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync(`UPDATE record_items SET product_id = $product_id WHERE id = $id`, {
				$id: id,
				$product_id: productId,
			});
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async addMany(
		items: Omit<DB.RecordItem, "id" | "timestamp">[],
		timestamp: number
	): Promise<Result<"Aplikasi bermasalah", number[]>> {
		try {
			const ids: number[] = [];
			await this.#db.withTransactionAsync(async () => {
				for (const item of items) {
					const res = await this.#db.runAsync(
						`INSERT INTO record_items (timestamp, name, price, qty, disc_val, capital, product_id)
				 VALUES ($timestamp, $name, $price, $qty, $disc_val, $capital, $product_id)`,
						{
							$timestamp: timestamp,
							$name: item.name.trim(),
							$price: item.price,
							$qty: item.qty,
							$disc_val: item.disc_val,
							$capital: item.capital,
							$product_id: item.product_id,
						}
					);
					ids.push(res.lastInsertRowId);
				}
			});
			return ok(ids);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
}
