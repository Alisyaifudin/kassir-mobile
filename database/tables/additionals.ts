import { err, ok, Result } from "@/lib/utils";
import { SQLiteRunResult, type SQLiteDatabase } from "expo-sqlite";

export class AdditionalTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	async getByRange(
		start: number,
		end: number
	): Promise<Result<"Aplikasi bermasalah", DB.Additional[]>> {
		try {
			const res = await this.#db.getAllAsync<DB.Additional>(
				`SELECT * FROM additionals WHERE timestamp BETWEEN $start AND $end ORDER BY timestamp DESC`,
				{ $start: start, $end: end }
			);
			return ok(res);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async getAllByTime(timestamp: number): Promise<Result<"Aplikasi bermasalah", DB.Additional[]>> {
		try {
			const res = await this.#db.getAllAsync<DB.Additional>(
				`SELECT * FROM additionals WHERE timestamp = $timestamp ORDER BY timestamp DESC`,
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
		items: Omit<DB.Additional, "id" | "timestamp">[],
		timestamp: number
	): Promise<Result<"Aplikasi bermasalah", number[]>> {
		try {
			const promises: Promise<SQLiteRunResult>[] = [];
			for (const item of items) {
				promises.push(
					this.#db.runAsync(
						`INSERT INTO additionals (timestamp, name, value, kind, eff_value)
				 VALUES ($timestamp, $name, $value, $kind, $eff_value)`,
						{
							$timestamp: timestamp,
							$name: item.name.trim(),
							$value: item.value,
							$kind: item.kind,
							$eff_value: item.eff_value,
						}
					)
				);
			}
			const ids = await Promise.all(promises);
			return ok(ids.map((id) => id.lastInsertRowId));
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async addManyTransaction(
		items: Omit<DB.Additional, "id" | "timestamp">[],
		timestamp: number
	): Promise<Result<"Aplikasi bermasalah", number[]>> {
		try {
			const ids: number[] = [];
			await this.#db.withTransactionAsync(async () => {
				for (const item of items) {
					const res = await this.#db.runAsync(
						`INSERT INTO additionals (timestamp, name, value, kind, eff_value)
				 VALUES ($timestamp, $name, $value, $kind, $eff_value)`,
						{
							$timestamp: timestamp,
							$name: item.name.trim(),
							$value: item.value,
							$kind: item.kind,
							$eff_value: item.eff_value,
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
