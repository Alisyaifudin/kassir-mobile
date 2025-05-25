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
}

type Mode = "buy" | "sell";
