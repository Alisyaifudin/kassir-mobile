import { createContext, useContext, useEffect, useState } from "react";
import { produce } from "immer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
import { numeric } from "@/lib/utils";
// eslint-disable-next-line import/no-named-as-default
import Decimal from "decimal.js";
import { getFixLocal } from "../settings/select-fix";

const discSchema = z.object({
	kind: z.enum(["percent", "number"]),
	value: z.number(),
});

const itemSchema = z.object({
	key: z.number(),
	id: z.number().int().nullable(),
	name: z.string().min(1),
	price: z.number(),
	qty: z.number().int(),
	stock: z.number().int().optional(),
	barcode: z.string().nullable(),
	discs: discSchema.array(),
});

const additionalSchema = z.object({
	name: z.string().min(1, { message: "Harus ada" }),
	kind: z.enum(["number", "percent"]),
	value: z.number(),
	key: z.number().int(),
});

export type Item = z.infer<typeof itemSchema>;
export type Disc = z.infer<typeof discSchema>;
export type Additional = z.infer<typeof additionalSchema>;

export function useItemsLocal(mode: Mode, products: DB.Product[]) {
	const [ready, setReady] = useState(false);
	const [items, setItems] = useState<Item[]>([]);
	const [additionals, setAdditionals] = useState<Additional[]>([]);
	const [fix, setFix] = useState(0);
	const [disc, setDisc] = useState<Disc>({
		kind: "percent",
		value: 0,
	});
	const [round, setRound] = useState(0);
	const [method, setMethod] = useState<DB.MethodType | null>(null); // null means cash

	useEffect(() => {
		async function get() {
			const [items, fix, adds] = await Promise.all([
				getItemsLocal(mode),
				getFixLocal(),
				getAdditionals(mode),
			]);
			setItems(items);
			setFix(fix);
			setAdditionals(adds);
			setReady(true);
		}
		get();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const itemsSet = {
		remove: (index: number) => {
			const rest = items.filter((_, i) => i !== index);
			setItems(rest);
			setItemsLocal(mode, rest);
		},
		add: (added: { id: number; price: number; name: string; barcode: string | null }) => {
			const index = items.findIndex(
				(i) => i.id === added.id || (i.barcode !== null && i.barcode === added.barcode)
			);
			const key = items.length > 0 ? Math.max(...items.map((a) => a.key)) + 1 : 0;
			if (index === -1) {
				const item: Item = { ...added, qty: 1, discs: [], key };
				setItems((prev) =>
					produce(prev, (draft) => {
						draft.push(item);
						setItemsLocal(mode, draft);
					})
				);
				return;
			}
			setItems((prev) =>
				produce(prev, (draft) => {
					draft[index].qty += 1;
					setItemsLocal(mode, draft);
				})
			);
		},
		addManual: (added: {
			qty: number;
			stock: number;
			price: number;
			name: string;
			barcode: string | null;
		}): "Barang dengan barcode tersebut sudah ada" | null => {
			const storedItem =
				products.find((i) => i.barcode !== null && i.barcode === added.barcode) !== undefined;
			const findItem =
				items.find((i) => i.barcode !== null && i.barcode === added.barcode) !== undefined;
			if (storedItem || findItem) {
				return "Barang dengan barcode tersebut sudah ada";
			}
			const key = items.length > 0 ? Math.max(...items.map((a) => a.key)) + 1 : 0;
			const item: Item = { id: null, ...added, discs: [], key };
			setItems((prev) =>
				produce(prev, (draft) => {
					draft.push(item);
					setItemsLocal(mode, draft);
				})
			);
			return null;
		},
		name: (index: number, val: string) => {
			setItems((prev) =>
				produce(prev, (draft) => {
					draft[index].name = val.trimStart();
					setItemsLocal(mode, draft);
				})
			);
		},
		barcode: (index: number, val: string) => {
			setItems((prev) =>
				produce(prev, (draft) => {
					if (val.trim() === "") {
						draft[index].barcode = null;
					} else {
						draft[index].barcode = val.trim();
					}
					setItemsLocal(mode, draft);
				})
			);
		},
		price: (index: number, val: string) => {
			const price = z.coerce.number().catch(0).parse(val);
			setItems((prev) =>
				produce(prev, (draft) => {
					draft[index].price = price;
					setItemsLocal(mode, draft);
				})
			);
		},
		qty: (index: number, val: string) => {
			const qty = z.coerce.number().int().catch(1).parse(val);
			setItems((prev) =>
				produce(prev, (draft) => {
					draft[index].qty = qty;
					setItemsLocal(mode, draft);
				})
			);
		},
		disc: {
			add(index: number) {
				setItems((prev) =>
					produce(prev, (draft) => {
						draft[index].discs.push({
							kind: "percent",
							value: 0,
						});
						setItemsLocal(mode, draft);
					})
				);
			},
			remove(itemIndex: number, discIndex: number) {
				setItems((prev) =>
					produce(prev, (draft) => {
						draft[itemIndex].discs = draft[itemIndex].discs.filter((_, i) => i !== discIndex);
						setItemsLocal(mode, draft);
					})
				);
			},
			kind(itemIndex: number, discIndex: number, val: string) {
				const kind = z.enum(["percent", "number"]).catch("percent").parse(val);
				setItems((prev) =>
					produce(prev, (draft) => {
						draft[itemIndex].discs[discIndex].kind = kind;
						switch (kind) {
							case "number":
								if (
									draft[itemIndex].discs[discIndex].value >
									draft[itemIndex].price * draft[itemIndex].qty
								) {
									draft[itemIndex].discs[discIndex].value =
										draft[itemIndex].price * draft[itemIndex].qty;
								}
								break;
							case "percent":
								if (draft[itemIndex].discs[discIndex].value > 100) {
									draft[itemIndex].discs[discIndex].value = 100;
								}
						}
						setItemsLocal(mode, draft);
					})
				);
			},
			value(itemIndex: number, discIndex: number, val: string) {
				let value = z.coerce.number().catch(0).parse(val);
				const MAX =
					items[itemIndex].discs[discIndex].kind === "percent"
						? 100
						: items[itemIndex].price * items[itemIndex].qty;
				if (value > MAX) {
					value = MAX;
				} else if (value < 0) {
					value = 0;
				}
				setItems((prev) =>
					produce(prev, (draft) => {
						draft[itemIndex].discs[discIndex].value = value;
						setItemsLocal(mode, draft);
					})
				);
			},
		},
	};
	const additionalsSet = {
		name: (index: number, val: string) => {
			setAdditionals((prev) =>
				produce(prev, (draft) => {
					draft[index].name = val.trimStart();
					setAdditionalsLocal(mode, draft);
				})
			);
		},
		kind: (index: number, val: string) => {
			const kind = z.enum(["percent", "number"]).catch("percent").parse(val);
			const MAX = kind === "percent" ? 100 : additionals[index].value;
			setAdditionals((prev) =>
				produce(prev, (draft) => {
					draft[index].kind = kind;
					if (draft[index].value > MAX) {
						draft[index].value = MAX;
					}
					setAdditionalsLocal(mode, draft);
				})
			);
		},
		value: (index: number, val: string) => {
			let num = numeric.catch(0).parse(val);
			if (num < 0) {
				return;
			}
			if (additionals[index].kind === "percent" && num > 100) {
				num = 100;
			}
			setAdditionals((prev) =>
				produce(prev, (draft) => {
					draft[index].value = num;
					setAdditionalsLocal(mode, draft);
				})
			);
		},
		add(data: { name: string; kind: "percent" | "number"; value: number }) {
			const key = additionals.length > 0 ? Math.max(...additionals.map((a) => a.key)) + 1 : 0;
			setAdditionals((prev) =>
				produce(prev, (draft) => {
					draft.push({
						key,
						name: data.name,
						value: data.value,
						kind: data.kind,
					});
					setAdditionalsLocal(mode, draft);
				})
			);
		},
		remove(index: number) {
			setAdditionals((prev) => {
				const additionals = prev.filter((_, i) => i !== index);
				setAdditionalsLocal(mode, additionals);
				return additionals;
			});
		},
	};
	const changeDisc = {
		value: (val: string) => {
			const num = numeric.catch(0).parse(val);
			setDisc((prev) => ({ ...prev, value: num }));
		},
		kind: (val: string) => {
			const kind = z.enum(["percent", "number"]).catch("percent").parse(val);
			setDisc((prev) => ({ ...prev, kind }));
		},
	};
	const changeRound = (round: number) => {
		setRound(round);
	};
	const changeMethod = (method: DB.MethodType | null) => {
		setMethod(method);
	};
	const reset = () => {
		setItems([]);
		setAdditionals([]);
		setItemsLocal(mode, []);
		setAdditionalsLocal(mode, []);
	};
	const val = {
		reset,
		ready,
		fix,
		items,
		disc,
		method,
		round,
		additionals,
		set: {
			method: changeMethod,
			round: changeRound,
			disc: changeDisc,
			additionals: {
				name: additionalsSet.name,
				value: additionalsSet.value,
				kind: additionalsSet.kind,
				add: additionalsSet.add,
				remove: additionalsSet.remove,
			},
			items: {
				add: itemsSet.add,
				addManual: itemsSet.addManual,
				remove: itemsSet.remove,
				name: itemsSet.name,
				barcode: itemsSet.barcode,
				price: itemsSet.price,
				qty: itemsSet.qty,
				disc: itemsSet.disc,
			},
		},
	};
	return val;
}

const ItemContext = createContext<null | {
	reset: () => void;
	mode: Mode;
	items: Item[];
	additionals: Additional[];
	fix: number;
	round: number;
	method: DB.MethodType | null;
	disc: {
		kind: "number" | "percent";
		value: number;
	};
	set: {
		method: (method: DB.MethodType | null) => void;
		round: (round: number) => void;
		disc: {
			value: (val: string) => void;
			kind: (val: string) => void;
		};
		additionals: {
			name: (index: number, val: string) => void;
			value: (index: number, val: string) => void;
			kind: (index: number, val: string) => void;
			add: (data: { name: string; kind: "percent" | "number"; value: number }) => void;
			remove: (index: number) => void;
		};
		items: {
			add: (added: { id: number; price: number; name: string; barcode: string | null }) => void;
			addManual: (added: {
				qty: number;
				stock: number;
				price: number;
				name: string;
				barcode: string | null;
			}) => "Barang dengan barcode tersebut sudah ada" | null;
			remove: (index: number) => void;
			name: (index: number, val: string) => void;
			barcode: (index: number, val: string) => void;
			price: (index: number, val: string) => void;
			qty: (index: number, val: string) => void;
			disc: {
				add(index: number): void;
				remove(itemIndex: number, discIndex: number): void;
				kind(itemIndex: number, discIndex: number, val: string): void;
				value(itemIndex: number, discIndex: number, val: string): void;
			};
		};
	};
}>(null);

export const ItemProvider = ItemContext.Provider;

export function useItems() {
	const ctx = useContext(ItemContext);
	if (ctx === null) {
		throw new Error("Outside item provider");
	}
	return ctx;
}

async function getItemsLocal(mode: Mode): Promise<Item[]> {
	try {
		const raw = await AsyncStorage.getItem(`${mode}-items`);
		if (raw === null) return [];
		const obj = JSON.parse(raw);
		const val = itemSchema.array().parse(obj);
		return val;
	} catch (error) {
		console.error(error);
		await AsyncStorage.removeItem(`${mode}-items`);
		return [];
	}
}

async function setItemsLocal(mode: Mode, items: Item[]) {
	try {
		const json = JSON.stringify(items);
		await AsyncStorage.setItem(`${mode}-items`, json);
	} catch (error) {
		console.error(error);
	}
}

async function getAdditionals(mode: Mode): Promise<Additional[]> {
	try {
		const raw = await AsyncStorage.getItem(`${mode}-additionals`);
		if (raw === null) return [];
		const obj = JSON.parse(raw);
		const val = additionalSchema.array().parse(obj);
		return val;
	} catch (error) {
		console.error(error);

		await AsyncStorage.removeItem(`${mode}-additionals`);
		return [];
	}
}

async function setAdditionalsLocal(mode: Mode, additionals: Additional[]) {
	try {
		const json = JSON.stringify(additionals);
		await AsyncStorage.setItem(`${mode}-additionals`, json);
	} catch (error) {
		console.error(error);
	}
}

export function calcSubTotal(item: Item, fix: number) {
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

export function calcTotalBeforeAdds(items: Item[], disc: Disc, fix: number) {
	let sub = new Decimal(0);
	for (const item of items) {
		const { subtotal } = calcSubTotal(item, fix);
		sub = sub.add(subtotal);
	}
	let total = sub;
	switch (disc.kind) {
		case "number":
			total = total.minus(disc.value);
			break;
		case "percent":
			const num = total.times(disc.value).div(100).toFixed(fix);
			total = total.minus(num);
			break;
	}
	return { totalBeforeAdds: total, subtotal: sub };
}

export function calcEffectiveAdds(total: Decimal, fix: number, additionals: Additional[]) {
	const addsVals: number[] = [];
	let totalAfterAdds = total;
	for (const additional of additionals) {
		switch (additional.kind) {
			case "number":
				addsVals.push(additional.value);
				totalAfterAdds = totalAfterAdds.add(additional.value);
				break;
			case "percent":
				const num = totalAfterAdds.times(additional.value).div(100).toFixed(fix);
				addsVals.push(Number(num));
				totalAfterAdds = totalAfterAdds.add(num);
				break;
		}
	}
	return { addsVals, totalAfterAdds };
}
