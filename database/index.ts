import { type SQLiteDatabase } from "expo-sqlite";
import { ProductTable } from "./tables/products";

export function generateDB(db: SQLiteDatabase) {
	return {
		product: new ProductTable(db),
	};
}

export type Database = ReturnType<typeof generateDB>;