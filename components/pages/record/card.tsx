import { Text } from "@/components/ui/text";
import { formatDate, formatTime } from "@/lib/utils";
import { View } from "react-native";
// eslint-disable-next-line import/no-named-as-default
import Decimal from "decimal.js";
import { Link } from "expo-router";

export function Card({ record, index }: { record: DB.Record; index: number }) {
	const total = new Decimal(record.total_from_items)
		.add(record.total_additional)
		.sub(record.disc_eff_val)
		.add(record.rounding)
		.toNumber();
	return (
		<Link
			href={{
				pathname: "/records/[timestamp]",
				params: { timestamp: record.timestamp },
			}}
			className="bg-zinc-50 mb-2 shadow-md p-2 flex-1"
		>
			<View className="flex-row gap-1 items-center">
				<Text className="w-7">{index + 1}.</Text>
				<Text className="w-24">{formatDate(record.timestamp).replace(/-/g, "/")}</Text>
				<Text className="w-16">{formatTime(record.timestamp, "long")}</Text>
				<View className="w-24 items-center">
					<Text>{record.cashier}</Text>
				</View>
				<View className="flex-1 items-end">
					<Text>Rp{total.toLocaleString("id-ID")}</Text>
				</View>
			</View>
		</Link>
	);
}
