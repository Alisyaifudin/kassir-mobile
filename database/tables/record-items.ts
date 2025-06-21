import { err, ok, Result } from "@/lib/utils";
import { type SQLiteDatabase } from "expo-sqlite";

export type RecordItem = DB.RecordItem & {
	capitals: { id: number; value: number; qty: number }[];
};

export class RecordItemTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	async getByRange(
		start: number,
		end: number
	): Promise<Result<"Aplikasi bermasalah", RecordItem[]>> {
		try {
			const res = await this.#db.getAllAsync<
				DB.RecordItem & { capital_id: number; capital: number; qty: number }
			>(
				`SELECT record_items.id, record_items.timestamp, record_items.name, record_items.price,
				record_items.disc_val, record_items.product_id, record_item_capitals.id AS capital_id,
				record_item_capitals.value AS capital, record_item_capitals.qty
				FROM record_items INNER JOIN record_item_capitals ON record_items.id = record_item_capitals.record_item_id
				WHERE timestamp BETWEEN $start AND $end ORDER BY timestamp DESC`,
				{ $start: start, $end: end }
			);
			const recordItems = collectItem(res);
			return ok(recordItems);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async getAllByTime(timestamp: number): Promise<Result<"Aplikasi bermasalah", RecordItem[]>> {
		try {
			const res = await this.#db.getAllAsync<
				DB.RecordItem & { capital_id: number; capital: number; qty: number }
			>(
				`SELECT record_items.id, record_items.timestamp, record_items.name, record_items.price,
				record_items.disc_val, record_items.product_id, record_item_capitals.id AS capital_id,
				record_item_capitals.value AS capital, record_item_capitals.qty
				FROM record_items INNER JOIN record_item_capitals ON record_items.id = record_item_capitals.record_item_id
				WHERE timestamp = ?`,
				timestamp
			);
			const recordItems = collectItem(res);
			return ok(recordItems);
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
		items: (Omit<DB.RecordItem, "id" | "timestamp"> & {
			capitals: { qty: number; value: number }[];
		})[],
		timestamp: number
	): Promise<Result<"Aplikasi bermasalah", number[]>> {
		try {
			const promises: Promise<Result<"Aplikasi bermasalah", number>>[] = [];
			for (const item of items) {
				promises.push(
					(async () => {
						const res = await this.#db.runAsync(
							`INSERT INTO record_items (timestamp, name, price, disc_val, product_id)
				 			 VALUES ($timestamp, $name, $price, $disc_val, $product_id)`,
							{
								$timestamp: timestamp,
								$name: item.name.trim(),
								$price: item.price,
								$disc_val: item.disc_val,
								$product_id: item.product_id,
							}
						);
						const id = res.lastInsertRowId;
						const ps: Promise<any>[] = [];
						for (const capital of item.capitals) {
							ps.push(
								this.#db.runAsync(
									`INSERT INTO record_item_capitals (record_item_id, value, qty)
				 			     VALUES ($id, $value, $qty)`,
									{
										$id: id,
										$value: capital.value,
										$qty: capital.qty,
									}
								)
							);
						}
						await Promise.all(ps);
						return ok(id);
					})()
				);
			}
			const res = await Promise.all(promises);
			const ids: number[] = [];
			for (const [errMsg, id] of res) {
				if (errMsg) return err(errMsg);
				ids.push(id);
			}
			return ok(ids);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	// async addManyTransaction(
	// 	items: Omit<DB.RecordItem, "id" | "timestamp">[],
	// 	timestamp: number
	// ): Promise<Result<"Aplikasi bermasalah", number[]>> {
	// 	try {
	// 		const ids: number[] = [];
	// 		await this.#db.withTransactionAsync(async () => {
	// 			for (const item of items) {
	// 				const res = await this.#db.runAsync(
	// 					`INSERT INTO record_items (timestamp, name, price, qty, disc_val, capital, product_id)
	// 			 VALUES ($timestamp, $name, $price, $qty, $disc_val, $capital, $product_id)`,
	// 					{
	// 						$timestamp: timestamp,
	// 						$name: item.name.trim(),
	// 						$price: item.price,
	// 						$qty: item.qty,
	// 						$disc_val: item.disc_val,
	// 						$capital: item.capital,
	// 						$product_id: item.product_id,
	// 					}
	// 				);
	// 				ids.push(res.lastInsertRowId);
	// 			}
	// 		});
	// 		return ok(ids);
	// 	} catch (error) {
	// 		console.error(error);
	// 		return err("Aplikasi bermasalah");
	// 	}
	// }
}

function collectItem(
	res: (DB.RecordItem & {
		capital_id: number;
		capital: number;
		qty: number;
	})[]
): RecordItem[] {
	const recordItems: RecordItem[] = [];
	for (const r of res) {
		const index = recordItems.findIndex((item) => item.id === r.id);
		if (index === -1) {
			recordItems.push({
				disc_val: r.disc_val,
				id: r.id,
				name: r.name,
				price: r.price,
				product_id: r.product_id,
				timestamp: r.timestamp,
				capitals: [
					{
						id: r.capital_id,
						qty: r.qty,
						value: r.capital,
					},
				],
			});
		} else {
			recordItems[index].capitals.push({
				id: r.capital_id,
				qty: r.qty,
				value: r.capital,
			});
		}
	}
	return recordItems;
}
