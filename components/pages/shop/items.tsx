import { Cond } from "@/components/Cond";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { FlatList, TouchableOpacity, View } from "react-native";
// eslint-disable-next-line import/no-named-as-default
import Decimal from "decimal.js";
import { X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Disc, type Item, useItems } from "./use-item";
import { useDebounceCallback } from "@react-hook/debounce";
import { z } from "zod";
import { DiscountBtn } from "./discount";
import { Show } from "@/components/Show";

export function ItemList() {
	const { items } = useItems();
	return (
		<FlatList
			data={items}
			renderItem={({ item, index }) => <ItemCell item={item} index={index} />}
			contentContainerStyle={{
				paddingBottom: 100,
			}}
		/>
	);
}

function ItemCell({ item, index }: { item: Item; index: number }) {
	const { set, removeItem, fix } = useItems();
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
			set.name(index, val);
		}, 300),
		barcode: useDebounceCallback((val: string) => {
			set.barcode(index, val);
		}, 300),
		price: useDebounceCallback((val: string) => {
			set.price(index, val);
		}, 300),
		qty: useDebounceCallback((val: string) => {
			set.qty(index, val);
		}, 300),
		disc: {
			add: useDebounceCallback(() => {
				set.disc.add(index);
			}, 300),
			remove: useDebounceCallback((discIndex: number) => {
				set.disc.remove(index, discIndex);
			}, 300),
			kind: useDebounceCallback((discIndex: number, val: string) => {
				set.disc.kind(index, discIndex, val);
			}, 300),
			value: useDebounceCallback((discIndex: number, val: string) => {
				set.disc.value(index, discIndex, val);
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
	const handleRemove = () => {
		removeItem(index);
	};
	const { discVals, subtotal } = calcTotal(item, fix);
	return (
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
					<Input value={itemLocal.name} className="flex-1" />
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
						<Input value={item.barcode ?? ""} />
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
					<Input keyboardType="numeric" value={itemLocal.qty.toString()} onChangeText={changeQty} />
				</View>
			</View>
			<Show when={item.discs.length > 0}>
				<Discount discVals={discVals} discs={item.discs} />
			</Show>
			<View className="flex flex-row justify-between items-center">
				<DiscountBtn index={index} item={item} />
				<Text className="text-xl">Subtotal: {subtotal.toNumber().toLocaleString("id-ID")}</Text>
			</View>
		</View>
	);
}

function calcTotal(item: Item, fix: number) {
	const discVals: number[] = [];
	let subtotal = new Decimal(item.price).times(item.qty);
	for (const disc of item.discs) {
		switch (disc.kind) {
			case "number":
				subtotal = subtotal.minus(disc.value);
				discVals.push(disc.value);
				break;
			case "percent":
				const val = subtotal.times(disc.value).div(100).toFixed(fix);
				subtotal = subtotal.minus(val);
				discVals.push(Number(val));
				break;
		}
	}
	return { subtotal, discVals };
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
