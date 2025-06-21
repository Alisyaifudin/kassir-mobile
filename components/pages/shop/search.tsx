import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useDebounceCallback } from "@react-hook/debounce";
import MiniSearch, { MatchInfo } from "minisearch";
import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useItems } from "./use-item";
import { ManualBtn } from "./manual";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { Product } from "@/database/tables/products";

export type ProductResult = Pick<Product, "barcode" | "name" | "price" | "id" | "capitals">;

export type Result = {
	terms: string[];
	queryTerms: string[];
	score: number;
	match: MatchInfo;
} & ProductResult;

export function Search({
	value,
	onChange,
	onEnter,
}: {
	value: string;
	onChange: (value: string) => void;
	onEnter: () => void;
}) {
	return (
		<View className="flex-1">
			<Input
				inputMode="search"
				placeholder="Cari..."
				value={value}
				onChangeText={onChange}
				onSubmitEditing={onEnter}
			/>
		</View>
	);
}

export function SearchItems({ products }: { products: Product[] }) {
	const { set } = useItems();
	const [value, setValue] = useState("");
	const [items, setItems] = useState<Result[]>([]);
	const miniSearch = useMemo(() => {
		const instance = new MiniSearch<Product>({
			fields: ["name", "barcode"],
			storeFields: ["id", "name", "barcode", "price", "capitals"],
			idField: "id",
			searchOptions: {
				tokenize: (query: string) => query.split(/[\s-&%#*]+/),
				processTerm: (term: string) => term.toLowerCase(),
			},
		});

		instance.addAll(products);
		return instance;
	}, [products]);
	const debounce = useDebounceCallback((q: string, submit: boolean) => {
		if (q.trim() === "") {
			setItems([]);
			return;
		}
		const items = miniSearch.search(q.trim(), {
			fuzzy: (term) => {
				if (term.split(" ").length === 1) {
					return 0.1;
				} else {
					return 0.2;
				}
			},
			prefix: true,
			combineWith: "AND",
		}) as Result[];
		setItems(items);
		if (submit && items.length === 1) {
			handlePress(items[0]);
		}
	}, 300);
	const handleChange = (v: string) => {
		setValue(v);
		debounce(v, false);
	};
	const handlePress = (item: Result) => {
		set.items.add({
			barcode: item.barcode,
			id: item.id,
			name: item.name,
			price: item.price,
			capitals: item.capitals
		});
		setItems([]);
		setValue("");
	};
	const handleEnter = () => {
		if (items.length === 0) return;
		handlePress(items[0]);
	};
	const handleScan = (v: string) => {
		setValue(v);
		debounce(v, true);
	};
	return (
		<View className="flex flex-col relative">
			<View className="flex-row justify-between items-center gap-2">
				<BarcodeScanner onScan={handleScan} />
				<Search value={value} onChange={handleChange} onEnter={handleEnter} />
				<ManualBtn />
			</View>
			<View
				className={cn(
					items.length === 0
						? "hidden"
						: "absolute top-12 z-10 bg-zinc-50 px-1 w-full border-zinc-200 border max-h-96"
				)}
			>
				<FlatList
					data={items}
					renderItem={({ item }) => <ItemCell item={item} onPress={handlePress} />}
					keyExtractor={(item) => item.id.toString()}
				/>
			</View>
		</View>
	);
}
function ItemCell({ item, onPress }: { item: Result; onPress: (item: Result) => void }) {
	return (
		<>
			<Button
				variant="ghost"
				onPress={() => onPress(item)}
				className="flex flex-row gap-2 justify-between native:px-0"
			>
				<View className="flex-1">
					<Text>{item.name}</Text>
				</View>
				<View className="w-32  flex flex-row justify-end">
					<Text className="text-end">{item.barcode}</Text>
				</View>
			</Button>
			<Separator />
		</>
	);
}
