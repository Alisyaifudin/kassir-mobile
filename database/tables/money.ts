/* eslint-disable import/no-named-as-default */
import { err, formatDate, ok, Result } from "@/lib/utils";
import Decimal from "decimal.js";
import { type SQLiteDatabase } from "expo-sqlite";
import { Temporal } from "temporal-polyfill";

export class MoneyTable {
	#db: SQLiteDatabase;
	constructor(db: SQLiteDatabase) {
		this.#db = db;
	}
	async get(start: number, end: number): Promise<Result<"Aplikasi bermasalah", DB.Money[]>> {
		try {
			const res = await this.#db.getAllAsync<DB.Money>(
				"SELECT * FROM money WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC",
				start,
				end
			);
			console.log("refetch", formatDate(start, "long"));
			return ok(res);
		} catch (error) {
			console.error(error);
			return err("Aplikasi bermasalah");
		}
	}
	async delete(timestamp: number): Promise<"Aplikasi bermasalah" | null> {
		try {
			await this.#db.runAsync("DELETE FROM money WHERE timestamp = ?", timestamp);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	get insert() {
		return {
			db: this.#db,
			async abs(value: number, kind: DB.MoneyKind): Promise<"Aplikasi bermasalah" | null> {
				const now = Temporal.Now.instant().epochMilliseconds;
				try {
					await this.db.runAsync(
						"INSERT INTO money (timestamp, value, kind) VALUES ($timestamp, $value, $kind)",
						{ $timestamp: now, $value: value, $kind: kind }
					);
					return null;
				} catch (error) {
					console.error(error);
					return "Aplikasi bermasalah";
				}
			},
			async change(value: number, kind: DB.MoneyKind): Promise<"Aplikasi bermasalah" | null> {
				const now = Temporal.Now.instant().epochMilliseconds;
				try {
					const res = await this.db.getFirstAsync<DB.Money>(
						"SELECT * FROM money WHERE kind = ? ORDER BY timestamp DESC LIMIT 1",
						kind
					);
					const curr = new Decimal(res === null ? 0 : res.value);
					await this.db.runAsync(
						"INSERT INTO money (timestamp, value, kind) VALUES ($timestamp, $value, $kind)",
						{ $timestamp: now, $value: curr.add(value).toNumber(), $kind: kind }
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
