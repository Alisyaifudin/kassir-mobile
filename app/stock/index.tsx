import { Await } from "@/components/Await";
import { FAB } from "@/components/Fab";
import { Item } from "@/components/pages/stock";
import { TopNav } from "@/components/TopNav";
import { useProducts } from "@/hooks/useProducts";
import { emitter } from "@/lib/event-emitter";
import { Link } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailScreen() {
	const state = useProducts();
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = useCallback(() => {
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
				{(products) => (
					<View style={styles.container}>
						<Link href="/stock/new-item" asChild>
							<FAB>
								<Plus size={24} color="white" />
							</FAB>
						</Link>
						<FlatList
							data={products}
							renderItem={({ item }) => <Item {...item} />}
							keyExtractor={(item) => item.id.toString()}
							contentContainerStyle={{
								paddingBottom: 100,
							}}
							refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
						/>
					</View>
				)}
			</Await>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
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
