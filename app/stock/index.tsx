import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function DetailScreen() {
	return (
		<View style={[styles.root]}>
			<View style={styles.container}>
				<Text>Stock</Text>
				<Link href="/stock/new-item">Baru</Link>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	container: {
		display: "flex",
	},
});
