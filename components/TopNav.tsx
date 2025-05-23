import { COLOR } from "@/lib/constants";
import { Href, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function TopNav({ children, href }: { children: string; href: Href }) {
	const router = useRouter();
	const handlePress = () => {
		router.back();
	};
	return (
		<View style={styles.container}>
			<Pressable onPress={handlePress}>
				<ChevronLeft size={30} />
			</Pressable>
			<Text style={styles.title}>{children}</Text>
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
		paddingLeft: 10,
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
