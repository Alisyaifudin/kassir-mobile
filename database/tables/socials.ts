import { err, ok, Result } from "@/lib/utils";
import { type SQLiteDatabase } from "expo-sqlite";

export class SocialTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	async get(): Promise<Result<"Aplikasi bermasalah", DB.Social[]>> {
		try {
			const res = await this.#db.getAllAsync<DB.Social>("SELECT * FROM socials");
			return ok(res);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async insert(name: string, value: string): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync("INSERT INTO socials (name, value) VALUES (?, ?)", name, value);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async update(id: number, name: string, value: string): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync("UPDATE socials SET name = $name, value = $value WHERE id = $id", {
				$id: id,
				$name: name,
				$value: value,
			});
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async delete(id: number): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync("DELETE FROM socials WHERE id = ?", id);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
}
