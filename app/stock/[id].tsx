import { Await } from "@/components/Await";
import { Tab } from "@/components/pages/stock/[id]";
import { TopNav } from "@/components/TopNav";
import { useAsync } from "@/hooks/useAsync";
import { useDB } from "@/hooks/useDB";
import { numeric } from "@/lib/utils";
import { Redirect, useLocalSearchParams } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
	const { id: raw } = useLocalSearchParams();
	const parsed = numeric.safeParse(raw);
	if (!parsed.success) {
		return <Redirect href="/stock" />;
	}
	const id = parsed.data;
	return (
		<SafeAreaView style={styles.root}>
			<KeyboardAvoidingView
				style={styles.root}
				behavior={Platform.OS === "ios" ? "padding" : "height"} // 'height' or 'padding' works differently on Android/iOS
			>
				<TopNav href="/stock">Edit Barang</TopNav>
				<Wrapper id={id} />
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

function Wrapper({ id }: { id: number }) {
	const db = useDB();
	const state = useAsync(() => db.product.getById(id));
	return <Await state={state}>{(product) => <Tab product={product} />}</Await>;
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		flexDirection: "column",
		gap: 5,
	},
	inner: {
		flexGrow: 1,
	},
});
