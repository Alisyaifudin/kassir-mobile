import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailScreen() {
	const colorScheme = useColorScheme();
	return (
		<SafeAreaView
			style={[
				styles.root,
				colorScheme === "dark" ? { backgroundColor: "black" } : { backgroundColor: "white" },
			]}
		>
			<View style={styles.container}>
				<Text>Stock</Text>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	container: {
		backgroundColor: "white",
    display
	},
});
