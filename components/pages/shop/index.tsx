import * as React from "react";
import { View } from "react-native";
import { ItemList } from "./items";
import { SearchItems } from "./search";
import { ItemProvider, useItemsLocal } from "./use-item";
import { TopNav } from "./topnav";
import { modeName } from "@/lib/constants";

export function Wrapper({ products, mode }: { products: DB.Product[]; mode: Mode }) {
	const { items, addItem, set } = useItemsLocal(mode);
	return (
		<ItemProvider value={{ items, addItem, set }}>
			<TopNav>{modeName[mode]}</TopNav>
			<View className="px-2 flex flex-col gap-2 flex-1">
				<SearchItems products={products} addItem={addItem} />
				<ItemList items={items} />
			</View>
		</ItemProvider>
	);
}
