import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetailScreen() {
	return (
		<SafeAreaView style={styles.container}>
			<TopNav>Pengturan</TopNav>
			<View className="gap-2 p-2">
				<Link href="/settings/profile" asChild>
					<Button variant="outline">
						<Text className="text-xl">Profil</Text>
					</Button>
				</Link>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 3,
	},
});
