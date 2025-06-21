import { type SQLiteDatabase } from "expo-sqlite";

export class RecordItemCapitalTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	async add(data: {
		value: number;
		qty: number;
		recordItemId: number;
	}): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync(
				"INSERT INTO record_item_capitals (record_item_id, value, qty) VALUES ($id, $value, $qty)",
				{
					$qty: data.qty,
					$id: data.recordItemId,
					$value: data.value,
				}
			);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
}
