import { Product } from "@/database/tables/products";
import MiniSearch, { SearchOptions, MatchInfo } from "minisearch";
import { useMemo } from "react";

export type ProductResult = Pick<
	Product,
	"barcode" | "name" | "price" | "id" | "note" | "capitals"
>;

export type Result = {
	terms: string[];
	queryTerms: string[];
	score: number;
	match: MatchInfo;
} & ProductResult;

export const useProductSearch = (products: DB.Product[]) => {
	const miniSearch = useMemo(() => {
		const instance = new MiniSearch<DB.Product>({
			fields: ["name", "barcode"],
			storeFields: ["id", "name", "barcode", "price", "capitals", "note"],
			idField: "id",
			searchOptions: {
				tokenize: (query: string) => query.split(/[\s-&%#*]+/),
				processTerm: (term: string) => term.toLowerCase(),
			},
		});

		instance.addAll(products);
		return instance;
	}, [products]);

	// Typed search function
	const search = (query: string, options?: SearchOptions) => {
		return miniSearch.search(query, options) as Result[];
	};

	return search;
};
