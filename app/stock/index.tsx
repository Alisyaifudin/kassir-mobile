import { Await } from "@/components/Await";
import { FAB } from "@/components/Fab";
import { Item } from "@/components/pages/stock";
import { Search } from "@/components/pages/stock/search";
import { TopNav } from "@/components/TopNav";
import { Product } from "@/database/tables/products";
import { useProducts } from "@/hooks/useProducts";
import { useProductSearch } from "@/hooks/useProductSearch";
import { emitter } from "@/lib/event-emitter";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailScreen() {
	const state = useProducts();
	const [refreshing, setRefreshing] = useState(false);
	const handleRefresh = useCallback(() => {
		setRefreshing(true);
		emitter.emit("fetch-products");
	}, []);
	useEffect(() => {
		if (!state.loading) {
			setRefreshing(false);
		}
	}, [state]);
	return (
		<SafeAreaView style={styles.root}>
			<TopNav>Stok</TopNav>
			<Await state={state}>
				{(products) => {
					return <Wrapper products={products} refreshing={refreshing} onRefresh={handleRefresh} />;
				}}
			</Await>
		</SafeAreaView>
	);
}

function Wrapper({
	products: all,
	refreshing,
	onRefresh,
}: {
	products: Product[];
	refreshing: boolean;
	onRefresh: () => void;
}) {
	const { query } = useLocalSearchParams<{ query?: string }>();
	const [products, setProducts] = useState(all);
	const search = useProductSearch(all);
	const router = useRouter();
	const setQuery = useCallback(
		(query: string) => {
			router.setParams({ query });
		},
		[router]
	);
	useEffect(() => {
		if (query === undefined) return;
		if (query.trim() === "") {
			setProducts(all);
		} else {
			const res = search(query.trim(), {
				fuzzy: (term) => {
					if (term.split(" ").length === 1) {
						return 0.1;
					} else {
						return 0.2;
					}
				},
				prefix: true,
				combineWith: "AND",
			});
			setProducts(res);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query]);
	return (
		<View style={styles.container}>
			<Link href="/stock/new-item" asChild>
				<FAB>
					<Plus size={24} color="white" />
				</FAB>
			</Link>
			<Search query={query ?? ""} setQuery={setQuery} />
			<FlatList
				data={products}
				renderItem={({ item }) => <Item item={item} />}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={{
					paddingBottom: 100,
				}}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		gap: 2,
		justifyContent: "flex-start",
	},
	scrollView: {
		flex: 1,
		backgroundColor: "pink",
		alignItems: "center",
		justifyContent: "center",
	},
	container: {
		display: "flex",
		flexDirection: "column",
		gap: 5,
		padding: 5,
		flex: 1,
	},
	link: {
		display: "flex",
		gap: 5,
		flexDirection: "row",
		alignItems: "center",
	},
});
