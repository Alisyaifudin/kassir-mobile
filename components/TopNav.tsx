import { COLOR } from "@/lib/constants";
import { ArrowLeft } from "@/lib/icons/ArrowLeft";
import { Href, Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export function TopNav({ children, href }: { children: string; href: Href }) {
	return (
		<View style={styles.container}>
			<Link href={href} replace>
				<ArrowLeft size={30} />
			</Link>
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
