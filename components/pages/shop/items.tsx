import { Cond } from "@/components/Cond";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { TouchableOpacity, View } from "react-native";
import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { calcSubTotal, Disc, type Item, useItems } from "./use-item";
import { useDebounceCallback } from "@react-hook/debounce";
import { z } from "zod";
import { DiscountBtn } from "./discount";
import { Show } from "@/components/Show";

export function ItemCard({
	item,
	index,
	totalBeforeAdds,
	subtotal: sub,
}: {
	item: Item;
	index: number;
	subtotal: number;
	totalBeforeAdds: number;
}) {
	const { set, fix, items } = useItems();
	const [itemLocal, setItemLocal] = useState({
		name: item.name,
		barcode: item.barcode ?? "",
		qty: item.qty === 0 ? "" : item.qty.toString(),
		price: item.price === 0 ? "" : item.price.toString(),
	});
	useEffect(() => {
		if (item.qty !== Number(itemLocal.qty)) {
			setItemLocal({ ...itemLocal, qty: item.qty.toString() });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [item.qty]);
	const debounce = {
		name: useDebounceCallback((val: string) => {
			set.items.name(index, val);
		}, 300),
		barcode: useDebounceCallback((val: string) => {
			set.items.barcode(index, val);
		}, 300),
		price: useDebounceCallback((val: string) => {
			set.items.price(index, val);
		}, 300),
		qty: useDebounceCallback((val: string) => {
			set.items.qty(index, val);
		}, 300),
		disc: {
			add: useDebounceCallback(() => {
				set.items.disc.add(index);
			}, 300),
			remove: useDebounceCallback((discIndex: number) => {
				set.items.disc.remove(index, discIndex);
			}, 300),
			kind: useDebounceCallback((discIndex: number, val: string) => {
				set.items.disc.kind(index, discIndex, val);
			}, 300),
			value: useDebounceCallback((discIndex: number, val: string) => {
				set.items.disc.value(index, discIndex, val);
			}, 300),
		},
	};
	const changePrice = (v: string) => {
		const parsed = z.coerce.number().safeParse(v);
		if (!parsed.success) {
			return;
		}
		const qty = parsed.data;
		if (qty < 0) {
			return;
		}
		setItemLocal({ ...itemLocal, price: v });
		debounce.price(v);
	};
	const changeQty = (v: string) => {
		const parsed = z.coerce.number().int().safeParse(v);
		if (!parsed.success) {
			return;
		}
		const qty = parsed.data;
		if (qty < 0) {
			return;
		}
		setItemLocal({ ...itemLocal, qty: v });
		debounce.qty(v);
	};
	const changeBarcode = (v: string) => {
		setItemLocal({ ...itemLocal, barcode: v.trim() });
		debounce.barcode(v);
	};
	const changeName = (v: string) => {
		setItemLocal({ ...itemLocal, name: v.trimStart() });
		debounce.name(v);
	};
	const handleRemove = () => {
		set.items.remove(index);
	};
	const { discVals, subtotal } = calcSubTotal(item, fix);
	return (
		<>
			<View className="flex gap-1 bg-zinc-50 p-0.5 mt-1 shadow-black shadow-md">
				<View className="flex flex-row gap-1 items-center pl-1">
					<Text>{index + 1}.</Text>
					<Cond
						when={item.id === null}
						fallback={
							<View className="flex-1 h-11 justify-center px-3">
								<Text className="native:text-lg">{item.name}</Text>
							</View>
						}
					>
						<Input value={itemLocal.name} className="flex-1" onChangeText={changeName} />
					</Cond>
					<TouchableOpacity onPress={handleRemove} className="bg-red-500 rounded-full">
						<X color="white" />
					</TouchableOpacity>
				</View>
				<View className="gap-1 flex-row">
					<View style={{ flex: 3 }}>
						<Text className="native:text-xs">Barcode:</Text>
						<Cond
							when={item.id === null}
							fallback={
								<View className="h-11 justify-center px-3">
									<Text className="native:text-lg">{item.barcode ?? "--------"}</Text>
								</View>
							}
						>
							<Input value={itemLocal.barcode} onChangeText={changeBarcode} />
						</Cond>
					</View>
					<View style={{ flex: 2 }}>
						<Text className="native:text-xs">Harga:</Text>
						<Input
							keyboardType="numeric"
							value={itemLocal.price.toString()}
							onChangeText={changePrice}
						/>
					</View>
					<View style={{ flex: 1 }}>
						<Text className="native:text-xs">Qty:</Text>
						<Input
							keyboardType="numeric"
							value={itemLocal.qty.toString()}
							onChangeText={changeQty}
						/>
					</View>
				</View>
				<Show when={item.discs.length > 0}>
					<Discount discVals={discVals} discs={item.discs} />
				</Show>
				<View className="flex flex-row justify-between items-center">
					<DiscountBtn index={index} item={item} />
					<Text className="text-xl">Total: {subtotal.toNumber().toLocaleString("id-ID")}</Text>
				</View>
			</View>
			<Show when={index === items.length - 1}>
				<View className="items-end mt-5">
					<Show when={sub !== totalBeforeAdds}>
						<Text className="text-xl">
							Subtotal: Rp{sub.toLocaleString("id-ID")}
						</Text>
						<Text className="text-xl">
							Potongan: Rp{(sub - totalBeforeAdds).toLocaleString("id-ID")}
						</Text>
					</Show>
					<Text className="font-bold text-xl">
						Total: Rp{totalBeforeAdds.toLocaleString("id-ID")}
					</Text>
				</View>
			</Show>
		</>
	);
}

function Discount({ discVals, discs }: { discVals: number[]; discs: Disc[] }) {
	return (
		<View>
			{discs.map((disc, i) => (
				<View key={i} className="flex flex-row justify-end itmes-center">
					<Text>Diskon{disc.kind === "percent" ? ` ${disc.value}%` : ""}:</Text>
					<View className="items-end w-20">
						<Text>{discVals[i].toLocaleString("id-ID")}</Text>
					</View>
				</View>
			))}
		</View>
	);
}
