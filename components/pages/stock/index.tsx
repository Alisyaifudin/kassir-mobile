import { COLOR } from "@/lib/constants";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export function Item({ name, price, id, capital, barcode, stock }: DB.Product) {
	return (
		<Link
			href={{
				pathname: "/stock/[id]",
				params: { id },
			}}
			style={styles.root}
		>
			<View>
				<Text selectable style={styles.name}>
					{name}
				</Text>
				<View style={styles.desc}>
					<View style={styles.prices}>
						<Text selectable>Harga: {price.toLocaleString("id-ID")}</Text>
					</View>
					<View style={styles.prices}>
						<Text selectable>Modal: {capital.toLocaleString("id-ID")}</Text>
					</View>
					<View style={styles["stock-container"]}>
						<Text selectable style={styles.stock}>
							Stok: {stock.toLocaleString("id-ID")}
						</Text>
					</View>
				</View>
				<View style={styles.link}>
					<Text selectable>Barcode: {barcode}</Text>
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
