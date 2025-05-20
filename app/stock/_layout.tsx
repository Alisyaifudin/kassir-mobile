import { Stack } from "expo-router";

export default function RootLayout() {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					headerTitle: "Stok",
				}}
			/>
			<Stack.Screen
				name="new-item"
				options={{
					headerTitle: "Barang Baru",
				}}
			/>
		</Stack>
	);
}
