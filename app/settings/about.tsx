import { TopNav } from "@/components/TopNav";
import { Text } from "@/components/ui/text";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
	return (
		<SafeAreaView className="flex-1">
			<TopNav>Tentang</TopNav>
			<View className="p-2 gap-1">
				<Text>Aplikasi `kassir` adalah aplikasi pencatatan pengeluaran dan pemasukan barang.</Text>
				<Text>Hak cipta © 2025 Muhammad Ali Syaifudin.</Text>
        <Text>
          Aplikasi dibuat dengan menggunakan React Native.
        </Text>
				<Text>
					Program ini bersifat sumber terbuka (<Text className="italic">open source</Text>) dengan lisensi MIT.
				</Text>
        <Text>
					Kode program bisa dilihat di:
				</Text>
        <Text selectable className="underline">https://github.com/Alisyaifudin/kassir-mobile</Text>
			</View>
		</SafeAreaView>
	);
}
