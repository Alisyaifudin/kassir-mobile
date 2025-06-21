import { err, ok, Result } from "@/lib/utils";
import { type SQLiteDatabase } from "expo-sqlite";

export class RecordTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	async getByTime(
		timestamp: number
	): Promise<Result<"Aplikasi bermasalah" | "Catatan tidak ada", DB.Record>> {
		try {
			const res = await this.#db.getFirstAsync<DB.Record>(
				`SELECT * FROM records WHERE timestamp = ?`,
				timestamp
			);
			if (res === null) return err("Catatan tidak ada");
			return ok(res);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async getByRange(
		start: number,
		end: number
	): Promise<Result<"Aplikasi bermasalah", DB.Record[]>> {
		try {
			const res = await this.#db.getAllAsync<DB.Record>(
				`SELECT * FROM records WHERE timestamp BETWEEN $start AND $end ORDER BY timestamp DESC`,
				{ $start: start, $end: end }
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
	async add(
		mode: DB.Mode,
		timestamp: number,
		data: Omit<DB.Record, "id" | "mode">
	): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync(
				`INSERT INTO records (timestamp, total_from_items, total_additional, disc_val, 
				 disc_eff_val, disc_kind, rounding, paid_at, mode, pay, method, note, cashier, pay)
				 VALUES ($timestamp, $total_from_items, $total_additional, $disc_val, $disc_eff_val, 
				 $disc_kind, $rounding, $paid_at, $mode, $pay, $method, $note, $cashier, $pay)`,
				{
					$timestamp: timestamp,
					$total_from_items: data.total_from_items,
					$total_additional: data.total_additional,
					$disc_val: data.disc_val,
					$disc_eff_val: data.disc_eff_val,
					$disc_kind: data.disc_kind,
					$rounding: data.rounding,
					$paid_at: data.paid_at,
					$mode: mode,
					$method: data.method,
					$note: data.note,
					$pay: data.pay,
					$cashier: data.cashier,
				}
			);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async del(timestamp: number): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync(`DELETE FROM records WHERE timestamp = ?`, timestamp);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	get update() {
		return {
			db: this.#db,
			async timestamp(timestamp: number, newTime: number) {
				try {
					await this.db.runAsync(
						`UPDATE records SET timestamp = $new_time WHERE timestamp = $timestamp`,
						{
							$new_time: newTime,
							$timestamp: timestamp,
						}
					);
					return null;
				} catch (error) {
					console.error(error);
					return "Aplikasi bermasalah";
				}
			},
			async credit(
				timestamp: number,
				credit: 0 | 1,
				pay: number
			): Promise<"Aplikasi bermasalah" | null> {
				try {
					await this.db.runAsync(
						`UPDATE records SET pay = $pay, credit = $credit, timestamp = $timestamp 
						 WHERE timestamp = $timestamp`,
						{
							$pay: pay,
							$credit: credit,
							$timestamp: timestamp,
						}
					);
					return null;
				} catch (error) {
					console.error(error);
					return "Aplikasi bermasalah";
				}
			},
			/**
			 *
			 * @param timestamp
			 * @param note
			 * @param methodId if null, meaning cash
			 * @returns
			 */
			async noteAndMethod(timestamp: number, note: string, methodId: number | null) {
				try {
					await this.db.runAsync(
						`UPDATE records SET note = $note, method = $method WHERE timestamp = $timestamp`,
						{
							$note: note,
							$method: methodId,
							$timestamp: timestamp,
						}
					);
					return null;
				} catch (error) {
					console.error(error);
					return "Aplikasi bermasalah";
				}
			},
		};
	}
}
