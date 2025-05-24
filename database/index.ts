import { type SQLiteDatabase } from "expo-sqlite";
import { ProductTable } from "./tables/products";
import { ProductImageTable } from "./tables/product-images";

export function generateDB(db: SQLiteDatabase) {
	return {
		product: new ProductTable(db),
		productImage: new ProductImageTable(db)
	};
}

export type Database = ReturnType<typeof generateDB>;