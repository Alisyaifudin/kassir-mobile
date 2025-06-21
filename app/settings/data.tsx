import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "@/components/TopNav";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { ProductDownload, ProductUpload } from "@/components/pages/settings/data/product";
import { Record } from "@/components/pages/settings/data/record";

export default function Page() {
	return (
		<SafeAreaView className="flex-1 gap-2">
			<TopNav>Data</TopNav>
			<View className="gap-2 px-2">
				<Text className="font-bold text-3xl">Unduh</Text>
				<ProductDownload />
				<Record />
			</View>
			<View className="gap-2 px-2">
				<Text className="font-bold text-3xl">Unggah</Text>
				<ProductUpload />
			</View>
		</SafeAreaView>
	);
}
