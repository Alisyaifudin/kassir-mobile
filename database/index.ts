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
import { ProductCapitalTable } from "./tables/product-capitals";
import { RecordItemCapitalTable } from "./tables/record-item-capitals";

export function generateDB(db: SQLiteDatabase) {
	return {
		additional: new AdditionalTable(db),
		cashier: new CashierTable(db),
		discount: new DiscountTable(db),
		method: new MethodTable(db),
		money: new MoneyTable(db),
		productImage: new ProductImageTable(db),
		product: new ProductTable(db),
		productCapital: new ProductCapitalTable(db),
		recordItem: new RecordItemTable(db),
		recordItemCapital: new RecordItemCapitalTable(db),
		record: new RecordTable(db),
		social: new SocialTable(db),
		raw: db,
	};
}

export type Database = ReturnType<typeof generateDB>;
