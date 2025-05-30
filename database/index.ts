import { type SQLiteDatabase } from "expo-sqlite";
import { ProductTable } from "./tables/products";
import { ProductImageTable } from "./tables/product-images";
import { CashierTable } from "./tables/cashiers";
import { MethodTable } from "./tables/methods";
import { AdditionalTable } from "./tables/additionals";
import { DiscountTable } from "./tables/discounts";
import { MoneyTable } from "./tables/money";
import { RecordItemTable } from "./tables/record-items";
import { RecordTable } from "./tables/records";
import { SocialTable } from "./tables/socials";

export function generateDB(db: SQLiteDatabase) {
	return {
		additional: new AdditionalTable(db),
		cashier: new CashierTable(db),
		discount: new DiscountTable(db),
		method: new MethodTable(db),
		money: new MoneyTable(db),
		productImage: new ProductImageTable(db),
		product: new ProductTable(db),
		recordItem: new RecordItemTable(db),
		record: new RecordTable(db),
		social: new SocialTable(db),
	};
}

export type Database = ReturnType<typeof generateDB>;
