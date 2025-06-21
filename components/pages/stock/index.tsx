import { TextError } from "@/components/TextError";
import { Product } from "@/database/tables/products";
import { COLOR } from "@/lib/constants";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export function Item({ item }: { item: Product }) {
	if (item.capitals.length === 0) {
		return <TextError>Kosong</TextError>;
	}
	const totalStock = item.capitals.map((c) => c.stock).reduce((prev, cur) => cur + prev);
	return (
		<Link
			href={{
				pathname: "/stock/[id]",
				params: { id: item.id },
			}}
			style={styles.root}
		>
			<View>
				<Text selectable style={styles.name}>
					{item.name}
				</Text>
				<View style={styles.desc}>
					<View style={styles.prices}>
						<Text selectable>Harga: {item.price.toLocaleString("id-ID")}</Text>
					</View>
					<View style={styles.prices}>
						<Text selectable>Modal: {item.capit als[0].value.toLocaleString("id-ID")}</Text>
					</View>
					<View style={styles["stock-container"]}>
						<Text selectable style={styles.stock}>
							Stok: {totalStock.toLocaleString("id-ID")}
						</Text>
					</View>
				</View>
				<View style={styles.link}>
					<Text selectable>Barcode: {item.barcode}</Text>
				</View>
			</View>
		</Link>
	);
}

const styles = StyleSheet.create({
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
		paddingRight: 5,
	},
	stock: {
		textAlign: "right",
	},
});
