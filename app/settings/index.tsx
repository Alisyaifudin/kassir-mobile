import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Href, Link } from "expo-router";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	ArrowRightLeft,
	Banknote,
	BookUser,
	CircleHelp,
	Database,
	LogOut,
	PersonStanding,
	Store,
	User,
} from "lucide-react-native";
import { useAction } from "@/hooks/useAction";
import { Session } from "@/lib/auth";
import { Show } from "@/components/Show";
import { emitter } from "@/lib/event-emitter";
import React from "react";

export default function DetailScreen() {
	const { action, loading } = useAction("", () => Session.logout());
	const handleLogout = async () => {
		await action();
		emitter.emit("fetch-session");
	};
	return (
		<SafeAreaView style={styles.container}>
			<View>
				<TopNav>Pengturan</TopNav>
				<View className="gap-2 p-2">
					<NavBtn icon={<User />} href="/settings/profile">
						Profil
					</NavBtn>
					<NavBtn icon={<Store />} href="/settings/shop">
						Toko
					</NavBtn>
					<NavBtn icon={<BookUser />} href="/settings/contact">
						Kontak
					</NavBtn>
					<NavBtn icon={<Database />} href="/settings/data">
						Data
					</NavBtn>
					<NavBtn icon={<PersonStanding />} href="/settings/cashier">
						Kasir
					</NavBtn>
					<NavBtn icon={<Banknote />} href="/settings/money">
						Uang
					</NavBtn>
					<NavBtn icon={<ArrowRightLeft />} href="/settings/method">
						Metode Pembayaran
					</NavBtn>
					<NavBtn icon={<CircleHelp />} href="/settings/about">
						Tentang
					</NavBtn>
				</View>
			</View>
			<View className="px-2">
				<Button onPress={handleLogout} className="flex-row gap-3 items-center justify-between">
					<View className="flex-row gap-3">
						<Text>Keluar</Text>
						<Show when={loading}>
							<ActivityIndicator color="white" />
						</Show>
					</View>
					<LogOut color="white" />
				</Button>
			</View>
		</SafeAreaView>
	);
}

function NavBtn({
	href,
	children,
	icon,
}: {
	href: Href;
	children: string;
	icon?: React.ReactNode;
}) {
	return (
		<Link href={href} asChild>
			<Button variant="outline" className="items-center gap-2 justify-start flex-row">
				{icon}
				<Text className="text-xl">{children}</Text>
			</Button>
		</Link>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 3,
		justifyContent: "space-between",
	},
});
