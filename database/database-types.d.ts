declare namespace DB {
	interface Product {
		id: number;
		name: string;
		price: number;
		stock: number;
		barcode: string | null;
		capital: number;
		note: string;
	}
	interface Image {
		uri: string;
	}
	interface ProductImage {
		id: number;
		uri: string;
		product_id: number;
		width: number;
		height: number;
		created_at: number;
	}
	type Method = "cash" | "transfer" | "debit" | "qris";
	interface Cashier {
		id: number;
		name: string;
		role: Role;
		password: string;
	}
	interface Record {
		timestamp: number;
		total_from_items: number;
		total_additional: number;
		disc_val: number;
		disc_eff_val: number;
		disc_kind: DiscKind;
		rounding: number;
		credit: 0 | 1;
		mode: Mode;
		pay: number;
		method: number;
		note: string;
	}
	interface RecordItem {
		id: number;
		timestamp: number;
		name: string;
		price: number;
		qty: number;
		disc_val: number;
		capital: number;
		product_id: number | null;
	}
	interface Additional {
		id: number;
		name: string;
		timestamp: number;
		value: number;
		kind: DiscKind;
		eff_value: number;
	}
	interface Discount {
		id: number;
		record_item_id: number;
		value: number;
		kind: DiscKind;
		eff_value: number;
	}
}

type Mode = "buy" | "sell";
type Role = "admin" | "manager" | "user";
type DiscKind = "number" | "percent";


declare module '*.sql' {
  const content: string;
  export default content;
}