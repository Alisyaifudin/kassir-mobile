import { Cond } from "@/components/Cond";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { FlatList, View } from "react-native";
// eslint-disable-next-line import/no-named-as-default
import Decimal from "decimal.js";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Item, useItems } from "./use-item";
import { useDebounceCallback } from "@react-hook/debounce";
import { z } from "zod";

export function ItemList({ items }: { items: Item[] }) {
	return (
		<FlatList
			data={items}
			renderItem={({ item, index }) => <ItemCell item={item} index={index} />}
			// keyExtractor={(item) => item.id.toString()}
			contentContainerStyle={{
				paddingBottom: 100,
			}}
		/>
	);
}

function ItemCell({ item, index }: { item: Item; index: number }) {
	const total = new Decimal(item.price).times(item.qty);
	const { set } = useItems();
	const [itemLocal, setItemLocal] = useState({
		name: item.name,
		barcode: item.barcode ?? "",
		qty: item.qty === 0 ? "" : item.qty.toString(),
		price: item.price === 0 ? "" : item.price.toString(),
	});
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
			</View>
			<View className="gap-1 flex-row">
				<View style={{ flex: 3 }}>
					<Text className="native:text-xs">Barcode:</Text>
					<Cond
						when={item.id === null}
						fallback={
							<View className="h-11 justify-center px-3">
								<Text className="native:text-lg">{item.barcode}</Text>
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
			<View className="flex flex-row justify-between items-center">
				<Button variant="secondary" className="flex-row">
					<Text>Diskon</Text>
					<Plus />
				</Button>
				<Text className="text-xl">Subtotal: {total.toNumber().toLocaleString("id-ID")}</Text>
			</View>
		</View>
	);
}
