declare namespace DB {
	type Role = "admin" | "manager" | "user";
	type DiscKind = "number" | "percent";
	type Mode = "buy" | "sell";
	type Method = "cash" | "transfer" | "debit" | "qris";
	type MoneyKind = "saving" | "debt";

	interface Product {
		id: number;
		name: string;
		price: number;
		barcode: string | null;
		note: string;
	}
	interface ProductCapital {
		id: number;
		product_id: number;
		value: number;
		stock: number;
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
	interface Cashier {
		id: number;
		name: string;
		role: Role;
		hash: string;
	}
	interface MethodType {
		id: number;
		name: string;
		label: string;
		method: Method;
	}
	interface Record {
		timestamp: number;
		total_from_items: number;
		disc_val: number;
		disc_eff_val: number;
		disc_kind: DiscKind;
		total_additional: number;
		rounding: number;
		mode: Mode;
		pay: number;
		method: Method;
		method_id: number | null; // method_type id
		note: string;
		cashier: string;
		paid_at: number | null;
	}
	interface RecordItem {
		id: number;
		timestamp: number;
		name: string;
		price: number;
		disc_val: number;
		product_id: number;
	}
	interface RecordItemCapital {
		id: number;
		record_item_id: number;
		value: number;
		qty: number;
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
	interface Social {
		id: number;
		name: string;
		value: string;
	}
	interface Money {
		timestamp: number;
		value: number;
		kind: MoneyKind;
	}
}

declare module "*.sql" {
	const content: string;
	export default content;
}
