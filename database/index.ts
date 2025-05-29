import { type SQLiteDatabase } from "expo-sqlite";
import { ProductTable } from "./tables/products";
import { ProductImageTable } from "./tables/product-images";
import { CashierTable } from "./tables/cashiers";
import { MethodTable } from "./tables/methods";

export function generateDB(db: SQLiteDatabase) {
	return {
		product: new ProductTable(db),
		productImage: new ProductImageTable(db),
		cashier: new CashierTable(db),
		method: new MethodTable(db),
	};
}

export type Database = ReturnType<typeof generateDB>;