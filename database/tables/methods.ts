import { err, ok, Result } from "@/lib/utils";
import { type SQLiteDatabase } from "expo-sqlite";

export class MethodTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	async get(): Promise<Result<"Aplikasi bermasalah", DB.MethodType[]>> {
		try {
			const methods = await this.#db.getAllAsync<DB.MethodType>(`SELECT * FROM method_types`);
			return ok(methods);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async insert(
		name: string,
		label: string,
		method: DB.Method
	): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync(
				`INSERT INTO method_types (name, label, method) VALUES ($name, $label, $method)`,
				{
					$name: name.trim(),
					$label: label.trim(),
					$method: method,
				}
			);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async update(id: number, name: string, label: string): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync(
				`UPDATE method_types SET name = $name, label = $label WHERE id = $id`,
				{
					$name: name,
					$label: label,
					$id: id,
				}
			);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async delete(id: number): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync("DELETE FROM method_types WHERE id = ?", id);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
}
