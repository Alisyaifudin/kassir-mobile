import { Search as SearchInput } from "@/components/ui/search";
import { useDebouncedCallback } from "use-debounce";
import { useState } from "react";
import { View } from "react-native";
import { BarcodeScanner } from "@/components/BarcodeScanner";

export function Search({ query, setQuery }: { query: string; setQuery: (v: string) => void }) {
	const [value, setValue] = useState(query);
	const debounced = useDebouncedCallback((value: string) => {
		setQuery(value);
	}, 500);
	const handleScan = (v: string) => {
		setQuery(v);
		setValue(v);
	};
	return (
		<View className="flex flex-row gap-2 items-center">
			<BarcodeScanner onScan={handleScan} />
			<SearchInput
				placeholder="Cari..."
				className="w-full"
				value={value}
				onChangeText={(val) => {
					setValue(val.trimStart());
					debounced(val);
				}}
			/>
		</View>
	);
}
