import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Href, Link } from "expo-router";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut } from "lucide-react-native";
import { useAction } from "@/hooks/useAction";
import { Session } from "@/lib/auth";
import { Show } from "@/components/Show";
import { emitter } from "@/lib/event-emitter";

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
					<NavBtn href="/settings/profile">Profil</NavBtn>
					<NavBtn href="/settings/method">Metode Pembayaran</NavBtn>
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

function NavBtn({ href, children }: { href: Href; children: string }) {
	return (
		<Link href={href} asChild>
			<Button variant="outline">
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
