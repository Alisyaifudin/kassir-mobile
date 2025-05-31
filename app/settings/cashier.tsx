import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "@/components/TopNav";
import { View } from "react-native";
import { useAsync } from "@/hooks/useAsync";
import { Await } from "@/components/Await";
import { useDB } from "@/hooks/useDB";
import { Card } from "@/components/pages/settings/cashier/card";
import { NewBtn } from "@/components/pages/settings/cashier/new-btn";
import { FAB } from "@/components/Fab";

export default function Page() {
	const db = useDB();
	const state = useAsync(() => db.cashier.getAll(), ["fetch-cashiers"]);
	return (
		<SafeAreaView className="flex-1 gap-2 justify-between">
			<View>
				<TopNav>Kasir</TopNav>
				<Await state={state}>
					{(cashiers) => (
						<View className="gap-2 p-1.5">
							{cashiers.map((cashier) => (
								<Card key={cashier.id} cashier={cashier} />
							))}
						</View>
					)}
				</Await>
			</View>
			<View>
				<FAB>
					<NewBtn />
				</FAB>
			</View>
		</SafeAreaView>
	);
}
