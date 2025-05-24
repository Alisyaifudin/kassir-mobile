import { type SQLiteDatabase } from "expo-sqlite";

export class ImageTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	async insert(uri: string): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.withTransactionAsync(async () => {
				await this.#db.runAsync(`INSERT INTO images VALUES ($uri)`, {$uri: uri});
				await this.#db.runAsync(
					`INSERT INTO product_images VALUES ($uri)`, 
					{$uri: uri});
			});
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async delete(uri: number): Promise<"Aplikasi bermasalah" | null> {
		const statement = await this.#db.prepareAsync("DELETE FROM images WHERE uri = $uri");
		try {
			await statement.executeAsync<DB.Product>({ $uri: uri });
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		} finally {
			await statement.finalizeAsync();
		}
		return null;
	}
}
