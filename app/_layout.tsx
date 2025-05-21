import { RootProvider } from "@/components/RootProvider";
import { migrateDbIfNeeded } from "@/database/migration";
import "@/global.css";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import * as React from "react";

export default function RootLayout() {
	return (
		<SQLiteProvider databaseName="data.db" onInit={migrateDbIfNeeded}>
			<RootProvider>
				<Stack
					screenOptions={{
						headerShown: false,
					}}
				>
					<Stack.Screen name="index" />
					<Stack.Screen name="stock" />
				</Stack>
			</RootProvider>
		</SQLiteProvider>
	);
}
