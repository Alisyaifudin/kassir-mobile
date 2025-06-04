import { RootProvider } from "@/components/RootProvider";
import { migrateDbIfNeeded } from "@/database/migration";
import "@/global.css";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { SQLiteProvider } from "expo-sqlite";

export default function RootLayout() {
	
	return (
		<SQLiteProvider databaseName="database.db" onInit={migrateDbIfNeeded}>
			<RootProvider>
				<Stack
					screenOptions={{
						headerShown: false,
					}}
				>
					<Stack.Screen name="index" />
					<Stack.Screen name="stock" />
					<Stack.Screen name="sell" />
					<Stack.Screen name="records" />
					<Stack.Screen name="money" />
					<Stack.Screen name="settings" />
				</Stack>
				<PortalHost />
				<Toast />
			</RootProvider>
		</SQLiteProvider>
	);
}
