import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { Href, Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
	return (
		<SafeAreaView style={styles.root}>
			<View style={styles.header}>
				<TextHeader>Kassir</TextHeader>
				<Link href="/settings" asChild>
					<TouchableOpacity style={styles.setting}>
						<Feather name="settings" size={24} color="black" />
					</TouchableOpacity>
				</Link>
			</View>
			<View style={styles.container}>
				<View style={styles.apps}>
					<View style={styles.grid}>
						<Button href="/shop">
							<AntDesign name="printer" size={64} />
							<Text>Toko</Text>
						</Button>
						<Button href="/stock">
							<SimpleLineIcons name="handbag" size={64} color="black" />
							<Text>Stok</Text>
						</Button>
						<Button href="/records">
							<FontAwesome5 name="clipboard-list" size={64} color="black" />
							<Text>Riwayat</Text>
						</Button>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}

type TextHeaderProps = React.ComponentProps<typeof Text>;

function TextHeader({ children, ...props }: TextHeaderProps) {
	return (
		<Text {...props} style={styles["header-text"]}>
			{children}
		</Text>
	);
}

function Button({ href, children }: { href: Href; children: React.ReactNode }) {
	return (
		<Link href={href} asChild>
			<TouchableOpacity style={styles.button}>{children}</TouchableOpacity>
		</Link>
	);
}

const styles = StyleSheet.create({
	"header-text": {
		fontWeight: "bold",
		fontSize: 40,
		fontStyle: "italic",
	},
	header: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 10,
	},
	root: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		gap: "1em",
	},
	container: {
		display: "flex",
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	apps: {
		display: "flex",
		flexDirection: "column",
		gap: 10,
	},
	grid: {
		display: "flex",
		flexDirection: "row",
		gap: 10,
		alignItems: "center",
	},
	button: {
		outline: "solid",
		outlineWidth: 1,
		width: 100,
		height: 100,
		justifyContent: "center",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	setting: {
		padding: 10,
		justifyContent: "center",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
});
