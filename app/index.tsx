import { Href, Link } from "expo-router";
import { Box, Hamburger, NotepadText, Settings, Warehouse } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
	return (
		<SafeAreaView style={styles.root}>
			<View style={styles.header}>
				<TextHeader>Kassir</TextHeader>
				<Link href="/settings" asChild>
					<TouchableOpacity style={styles.setting}>
						<Settings size={24} />
					</TouchableOpacity>
				</Link>
			</View>
			<View style={styles.container}>
				<View style={styles.apps}>
					<View style={styles.grid}>
						<Button href="/sell">
							<Hamburger size={64} />
							<Text>Jual</Text>
						</Button>
						<Button href="/buy">
							<Box size={64} />
							<Text>Beli</Text>
						</Button>
					</View>
					<View style={styles.grid}>
						<Button href="/stock">
							<Warehouse size={64} />
							<Text>Stok</Text>
						</Button>
						<Button href="/records">
							<NotepadText size={64} />
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
