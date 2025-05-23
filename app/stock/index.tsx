import { Await } from "@/components/Await";
import { FAB } from "@/components/Fab";
import { TopNav } from "@/components/TopNav";
import { useProducts } from "@/hooks/useProducts";
import { COLOR } from "@/lib/constants";
import { Link } from "expo-router";
import { Plus, SquareArrowOutUpRight } from "lucide-react-native";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailScreen() {
	const state = useProducts();
	return (
		<SafeAreaView style={styles.root}>
			<TopNav href="/">Stok</TopNav>
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

const Item = ({ name, price, id, capital, barcode, stock }: DB.Product) => (
	<View style={styleItem.root}>
		<Text selectable style={styleItem.name}>
			{name}
		</Text>
		<View style={styleItem.desc}>
			<View style={styleItem.prices}>
				<Text selectable>Harga: {price.toLocaleString("id-ID")}</Text>
			</View>
			<View style={styleItem.prices}>
				<Text selectable>Modal: {capital.toLocaleString("id-ID")}</Text>
			</View>
			<View style={styleItem["stock-container"]}>
				<Text selectable style={styleItem.stock}>
					Stok: {stock.toLocaleString("id-ID")}
				</Text>
			</View>
		</View>
		<View style={styleItem.link}>
			<View>
				<Text selectable>Barcode: {barcode}</Text>
			</View>
			<View>
				<Link
					href={{
						pathname: "/stock/[id]",
						params: { id },
					}}
				>
					<SquareArrowOutUpRight />
				</Link>
			</View>
		</View>
	</View>
);

const styleItem = StyleSheet.create({
	root: {
		flex: 1,
		display: "flex",
		gap: 5,
		padding: 5,
		backgroundColor: COLOR.zinc["50"],
		marginVertical: 3,
		boxShadow: `2px 2px 2px 1px ${COLOR.zinc[300]}`,
	},
	name: {
		fontSize: 20,
	},
	desc: {
		display: "flex",
		flexDirection: "row",
	},
	link: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	prices: {
		width: "40%",
	},
	"stock-container": {
		width: "20%",
		display: "flex",
		justifyContent: "flex-end",
	},
	stock: {
		textAlign: "right",
	},
});
