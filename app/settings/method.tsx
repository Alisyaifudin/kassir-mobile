import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "@/components/TopNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentMethod } from "@/components/pages/settings/method/payment";

export default function Page() {
	const [tab, setTab] = useState<Exclude<DB.Method, "cash">>("transfer");
	const methods = ["transfer", "debit", "qris"] as const;
	return (
		<SafeAreaView className="flex-1">
			<TopNav>Metode Pembayaran</TopNav>
			<Tabs
				value={tab}
				onValueChange={(v) => setTab(v as any)}
				className="w-full max-w-full mx-auto flex-col gap-1.5 flex-1"
			>
				<TabsList className="flex-row w-full">
					<TabsTrigger value="transfer" className="flex-1">
						<Text>Transfer</Text>
					</TabsTrigger>
					<TabsTrigger value="debit" className="flex-1">
						<Text>Debit</Text>
					</TabsTrigger>
					<TabsTrigger value="qris" className="flex-1">
						<Text>QRIS</Text>
					</TabsTrigger>
				</TabsList>
				{methods.map((method) => (
					<TabsContent key={method} value={method} className="flex-1">
						<PaymentMethod method={method} />
					</TabsContent>
				))}
			</Tabs>
		</SafeAreaView>
	);
}
