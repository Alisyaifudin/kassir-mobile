import { Stack } from "expo-router";

export default function Layout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="index" />
			<Stack.Screen name="profile" />
			<Stack.Screen name="shop" />
			<Stack.Screen name="contact" />
			<Stack.Screen name="data" />
			<Stack.Screen name="cashier" />
			<Stack.Screen name="money" />
			<Stack.Screen name="method" />
			<Stack.Screen name="about" />
		</Stack>
	);
}
