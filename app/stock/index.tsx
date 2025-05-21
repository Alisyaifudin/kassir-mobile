import { Await } from "@/components/Await";
import { TopNav } from "@/components/TopNav";
import { useProducts } from "@/hooks/useProducts";
import { Link } from "expo-router";
import { Plus } from "lucide-react-native";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailScreen() {
	const state = useProducts();
	return (
		<SafeAreaView style={styles.root}>
			<TopNav href="/">Stok</TopNav>
			<Await state={state}>
				{(products) => (
					<View style={styles.container}>
						<View style={styles.add}>
							<Link href="/stock/new-item" asChild>
								<TouchableOpacity style={styles.link}>
									<Text style={{ color: "white" }}>Tambah</Text>
									<Plus size={24} color="white" />
								</TouchableOpacity>
							</Link>
						</View>
						<FlatList
							data={products}
							renderItem={({ item }) => <Item title={item.name} />}
							keyExtractor={(item) => item.id.toString()}
						/>
					</View>
				)}
			</Await>
		</SafeAreaView>
	);
}

type ItemProps = { title: string };

const Item = ({ title }: ItemProps) => (
	<View style={styles.item}>
		<Text>{title}</Text>
	</View>
);

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	add: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-end",
	},
	container: {
		display: "flex",
		flexDirection: "column",
		gap: 5,
		padding: 5,
	},
	link: {
		paddingVertical: 5,
		paddingHorizontal: 10,
		backgroundColor: "black",
		color: "white",
		display: "flex",
		gap: 5,
		flexDirection: "row",
		alignItems: "center",
	},
	item: {},
});
