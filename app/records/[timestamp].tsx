import { TopNav } from "@/components/TopNav";
import { Text } from "@/components/ui/text";
import { integer } from "@/lib/utils";
import { Redirect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
	const { timestamp: raw } = useLocalSearchParams<{ timestamp: string }>();
	const parsed = integer.safeParse(raw);
	if (!parsed.success) {
		return <Redirect href="/records" />;
	}
	const timestamp = parsed.data;
	return (
		<SafeAreaView className="flex-1 gap-5">
			<TopNav>Riwayat Barang</TopNav>
			<Text>{timestamp}</Text>
		</SafeAreaView>
	);
}
