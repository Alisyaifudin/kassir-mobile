import { err, ok, Result } from "@/lib/utils";
import { SQLiteBindValue, type SQLiteDatabase } from "expo-sqlite";

export class DiscountTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	async getById(id: number): Promise<Result<"Aplikasi bermasalah", DB.Discount[]>> {
		try {
			const res = await this.#db.getAllAsync<DB.Discount>(
				`SELECT * FROM discounts WHERE record_item_id = ?`,
				id
			);
			return ok(res);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async getAllByTime(timestamp: number): Promise<Result<"Aplikasi bermasalah", DB.Discount[]>> {
		try {
			const res = await this.#db.getAllAsync<DB.Discount>(
				`SELECT discounts.id, discounts.record_item_id, discounts.value, discounts.kind, discounts.eff_value
				 FROM discounts INNER JOIN record_items ON discounts.record_item_id = record_items.id
				 WHERE record_items.timestamp = ?`,
				timestamp
			);
			return ok(res);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async addMany(
		itemId: number,
		discounts: { value: number; kind: DiscKind; effValue: number }[]
	): Promise<"Aplikasi bermasalah" | null> {
		try {
			const bindings: SQLiteBindValue[] = [];
			const stmts: string[] = [];
			for (const discount of discounts) {
				stmts.push("(?, ?, ?, ?)");
				bindings.push(itemId, discount.value, discount.kind, discount.effValue);
			}
			const stmt =
				`INSERT INTO discounts (record_item_id, value, kind, eff_value) VALUES ` + stmts.join(", ");
			await this.#db.runAsync(stmt, bindings);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
}
