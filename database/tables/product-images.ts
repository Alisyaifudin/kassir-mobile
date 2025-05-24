import { err, ok, Result } from "@/lib/utils";
import { SQLiteRunResult, type SQLiteDatabase } from "expo-sqlite";
export class ProductImageTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	async insert(data: {
		uri: string;
		productId: number;
		width: number;
		height: number;
		created: number;
	}): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.withTransactionAsync(async () => {
				await this.#db.runAsync(`INSERT INTO images VALUES ($uri)`, { $uri: data.uri });
				await this.#db.runAsync(
					`INSERT INTO product_images (uri, product_id, width, height, created_at) 
			     VALUES ($uri, $id, $w, $h, $created)`,
					{
						$uri: data.uri,
						$id: data.productId,
						$w: data.width,
						$h: data.height,
						$created: data.created,
					}
				);
			});
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async delete(uri: string): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.withTransactionAsync(async () => {
				Promise.all([
					this.#db.runAsync("DELETE FROM images WHERE uri = ?", uri),
					this.#db.runAsync("DELETE FROM product_images WHERE uri = ?", uri),
				]);
			});
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async deleteByProductId(
		productId: number,
		uris: string[]
	): Promise<"Aplikasi bermasalah" | null> {
		try {
			const promises: Promise<SQLiteRunResult>[] = [];
			for (const uri of uris) {
				promises.push(this.#db.runAsync("DELETE FROM images WHERE uri = ?", uri));
			}
			await this.#db.withTransactionAsync(async () => {
				Promise.all([
					...promises,
					this.#db.runAsync("DELETE FROM product_images WHERE product_id = ?", productId),
				]);
			});
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async getByProductId(id: number): Promise<Result<"Aplikasi bermasalah", DB.ProductImage[]>> {
		try {
			const images = await this.#db.getAllAsync<DB.ProductImage>(
				"SELECT * FROM product_images WHERE product_id = ?",
				id
			);
			return ok(images);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
}
