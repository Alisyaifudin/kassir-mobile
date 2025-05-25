import { Await } from "@/components/Await";
import { Wrapper } from "@/components/pages/shop";
import { useProducts } from "@/hooks/useProducts";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailScreen() {
	const state = useProducts();
	return (
		<SafeAreaView style={styles.root}>
			<Await state={state}>{(products) => <Wrapper mode="buy" products={products} />}</Await>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		gap: 3,
	},
});
