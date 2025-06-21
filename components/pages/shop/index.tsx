import * as React from "react";
import { View } from "react-native";
import { SearchItems } from "./search";
import { ItemProvider, useItemsLocal } from "./use-item";
import { TopNav } from "./topnav";
import { modeName } from "@/lib/constants";
import { List } from "./list";
import { Product } from "@/database/tables/products";

export function Wrapper({ products, mode }: { products: Product[]; mode: DB.Mode }) {
	const { ready, ...ctx } = useItemsLocal(mode, products);
	if (!ready) {
		return null;
	}
	return (
		<ItemProvider value={{...ctx, mode}}>
			<TopNav>{modeName[mode]}</TopNav>
			<View className="px-2 flex flex-col gap-2 flex-1">
				<SearchItems products={products} />
				<List />
			</View>
		</ItemProvider>
	);
}
