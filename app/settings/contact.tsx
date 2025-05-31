import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "@/components/TopNav";
import { View } from "react-native";
import { useAsync } from "@/hooks/useAsync";
import { Await } from "@/components/Await";
import { useDB } from "@/hooks/useDB";
import { Card } from "@/components/pages/settings/contact/card";
import { NewBtn } from "@/components/pages/settings/contact/new-btn";
import { FAB } from "@/components/Fab";

export default function Page() {
	const db = useDB();
	const state = useAsync(() => db.social.get(), ["fetch-socials"]);
	return (
		<SafeAreaView className="flex-1 gap-2 justify-between">
			<View>
				<TopNav>Kontak</TopNav>
				<Await state={state}>
					{(socials) => (
						<View className="gap-2">
							{socials.map((social) => (
								<Card key={social.id} social={social} />
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
