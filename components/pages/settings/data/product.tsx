import { ActivityIndicator, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Show } from "@/components/Show";
import { useAction } from "@/hooks/useAction";
import { constructCSV, downloadCSV } from "@/lib/download";
import { useDB } from "@/hooks/useDB";
import { Temporal } from "temporal-polyfill";
import Toast from "react-native-toast-message";
import { TextError } from "@/components/TextError";

export function Product() {
	const db = useDB();
	const { loading, error, setError, action } = useAction("", async () => {
		const [errProduct, products] = await db.product.getAll();
		if (errProduct) return errProduct;
		const [errCSV, csvFile] = constructCSV(products);
		if (errCSV) return errCSV;
		const now = Temporal.Now.instant().epochMilliseconds;
		const [errDownload, msg] = await downloadCSV(csvFile, `products-${now}.csv`);
		if (errDownload) return errDownload;
		Toast.show({
			type: "success",
			text1: msg,
		});
		return null;
	});
	const handleClick = async () => {
		const errMsg = await action();
		setError(errMsg);
	};
	return (
		<View className="flex gap-2 p-2 bg-sky-50">
			<View className="gap-2 flex-row justify-between items-center">
				<Text className="italic text-xl">Produk</Text>
				<Button onPress={handleClick} className="flex-row gap-2 items-center">
					<Text>Unduh</Text>
					<Show when={loading}>
						<ActivityIndicator color="white" />
					</Show>
				</Button>
			</View>
			<TextError when={error !== null && error !== ""}>{error}</TextError>
		</View>
	);
}
