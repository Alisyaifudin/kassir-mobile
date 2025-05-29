import { crypt } from "@/lib/auth";
import { err, ok, Result } from "@/lib/utils";
import { type SQLiteDatabase } from "expo-sqlite";

export class CashierTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	async get(id: number): Promise<Result<"Aplikasi bermasalah", DB.Cashier | null>> {
		try {
			const cashier = await this.#db.getFirstAsync<DB.Cashier>(
				"SELECT * FROM cashiers WHERE id = ?",
				id
			);
			return ok(cashier);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async getAll(): Promise<Result<"Aplikasi bermasalah", DB.Cashier[]>> {
		try {
			const cashiers = await this.#db.getAllAsync<DB.Cashier>("SELECT * FROM cashiers");
			return ok(cashiers);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async updateRole(id: number, role: Role): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync("UPDATE cashiers SET role = $role WHERE id = $id", {
				$id: id,
				$role: role,
			});
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async updateName(id: number, name: string): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync("UPDATE cashiers SET name = $name WHERE id = $id", {
				$id: id,
				$name: name,
			});
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async del(id: number): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync("DELETE FROM cashiers WHERE id = ? AND role != 'admin'", id);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	async insert(cashier: {
		name: string;
		password: string;
		role: Role;
	}): Promise<Result<"Aplikasi bermasalah", number>> {
		try {
			const hash = await crypt.hash(cashier.password);
			const res = await this.#db.runAsync(
				"INSERT INTO cashiers (name, password, role) VALUES ($name, $hash, $role)",
				{ $name: cashier.name, $hash: hash, $role: cashier.role }
			);
			return ok(res.lastInsertRowId);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
}
