import { type SQLiteDatabase } from "expo-sqlite";

export class ProductCapitalTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	async sell(
		data:
			| {
					capitalId: number;
					qty: number;
					delete: false;
			  }
			| {
					capitalId: number;
					delete: true;
			  }
	): Promise<"Aplikasi bermasalah" | null> {
		try {
			if (data.delete) {
				await this.#db.runAsync("DELETE FROM product_capitals WHERE id = ?", data.capitalId);
				return null;
			}
			await this.#db.runAsync("UPDATE product_capitals SET stock = stock - $qty WHERE id = $id", {
				$qty: data.qty,
				$id: data.capitalId,
			});
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async buy(data: {
		id: number;
		qty: number;
		capital: number;
	}): Promise<"Aplikasi bermasalah" | "Barang tidak ada" | null> {
		try {
			const capitals = await this.#db.getAllAsync<DB.ProductCapital>(
				"SELECT * FROM product_capitals WHERE product_id = ?",
				data.id
			);
			if (capitals.length === 0) return "Barang tidak ada";
			const capital = capitals.find((c) => c.value === data.capital);
			if (capital) {
				await this.#db.runAsync(`UPDATE product_capitals SET stock = stock + $qty WHERE id = $id`, {
					$qty: data.qty,
					$id: capital.id,
				});
			} else {
				await this.#db.runAsync(
					`INSERT INTO product_capitals (value, stock, product_id) VALUES ($capital, $qty, $id)`,
					{
						$id: data.id,
						$value: data.capital,
						$qty: data.qty,
					}
				);
			}
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
}
