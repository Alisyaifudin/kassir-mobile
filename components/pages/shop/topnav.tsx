import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { COLOR } from "@/lib/constants";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

export function TopNav({ children }: { children: string }) {
	const router = useRouter();
	const handlePress = () => {
		router.back();
	};
	return (
		<View style={styles.container}>
			<View className="flex flex-row gap-2 items-center">
				<Pressable onPress={handlePress}>
					<ChevronLeft size={30} />
				</Pressable>
				<Text style={styles.title}>{children}</Text>
			</View>
			<Button className="native:py-0">
				<Text className="native:text-xl">Bayar</Text>
			</Button>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		height: 60,
		paddingHorizontal: 10,
		justifyContent: "space-between",
		borderBottomWidth: 1,
		borderBottomColor: COLOR.zinc[200],
		boxShadow: `0px 2px 3px ${COLOR.zinc[300]}`,
		backgroundColor: COLOR.zinc[50],
	},
	title: {
		fontSize: 22,
		fontWeight: "bold",
	},
});
