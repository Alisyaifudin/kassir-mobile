// eslint-disable-next-line import/no-named-as-default
import Decimal from "decimal.js";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Show } from "@/components/Show";

type Props = {
	item: DB.RecordItem;
	discs: DB.Discount[];
  index: number
};

export function ReceiptItem({ item, discs, index }: Props) {
	const totalBeforeDisc = new Decimal(item.price).times(item.qty);
	const discsFiltered = discs.filter((disc) => disc.record_item_id === item.id);
	const discsVal: {
		kind: DiscKind;
		value: number;
		effVal: number;
		sub: number;
	}[] = [];
	let sub = new Decimal(totalBeforeDisc);
	for (const disc of discsFiltered) {
		sub = sub.sub(disc.eff_value);
		discsVal.push({
			kind: disc.kind,
			value: disc.value,
			effVal: disc.eff_value,
			sub: sub.toNumber(),
		});
	}
	return (
		<View className="flex flex-col">
			<Text className="text-wrap">{index+1}. {item.name}</Text>
			<View className="flex flex-row justify-between">
				<View className="flex flex-row gap-1">
					<Text>{item.price.toLocaleString("id-ID")}</Text>
					<Text>&#215;</Text>
					<Text>{item.qty}</Text>
				</View>
				<Text>{totalBeforeDisc.toNumber().toLocaleString("id-ID")}</Text>
			</View>
			<Show when={discsVal.length > 0}>
				{discsVal.map((disc, i) => {
					return (
						<View key={i} className="flex flex-row justify-between">
							<Discount type={disc.kind} value={disc.value} effValue={disc.effVal} />
							<Text>({disc.sub.toLocaleString("id-ID")})</Text>
						</View>
					);
				})}
			</Show>
		</View>
	);
}

function Discount({
	type,
	value,
	effValue,
}: {
	type: "number" | "percent";
	value: number;
	effValue: number;
}) {
	switch (type) {
		case "number":
			return <Text>(Disk. {effValue.toLocaleString("id-ID")})</Text>;
		case "percent":
			return (
				<Text>
					(Disk. {value}% = {effValue.toLocaleString("id-ID")})
				</Text>
			);
	}
}
