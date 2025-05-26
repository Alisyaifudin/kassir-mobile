import { createContext, useContext, useEffect, useState } from "react";
import { produce } from "immer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";

const discSchema = z.object({
	kind: z.enum(["percent", "number"]),
	value: z.number(),
});

const itemSchema = z.object({
	id: z.number().int().nullable(),
	name: z.string().min(1),
	price: z.number(),
	qty: z.number().int(),
	barcode: z.string().nullable(),
	discs: discSchema.array(),
});

export type Item = z.infer<typeof itemSchema>;

export type Disc = z.infer<typeof discSchema>;

export function useItemsLocal(mode: Mode) {
	const [items, setItems] = useState<Item[]>([]);
	const [fix, setFix] = useState(0);

	useEffect(() => {
		getItemsLocal(mode).then((items) => setItems(items));
		getFixLocal(mode).then((fix) => setFix(fix));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const removeItem = (index: number) => {
		const rest = items.filter((_, i) => i !== index);
		setItems(rest);
		setItemsLocal(mode, rest);
	};
	const addItem = (added: { id: number; price: number; name: string; barcode: string | null }) => {
		const index = items.findIndex(
			(i) => i.id === added.id || (i.barcode !== null && i.barcode === added.barcode)
		);
		if (index === -1) {
			const item: Item = { ...added, qty: 1, discs: [] };
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
	};
	const changeName = (index: number, val: string) => {
		setItems((prev) =>
			produce(prev, (draft) => {
				draft[index].name = val.trimStart();
				setItemsLocal(mode, draft);
			})
		);
	};
	const changeBarcode = (index: number, val: string) => {
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
	};
	const changePrice = (index: number, val: string) => {
		const price = z.coerce.number().catch(0).parse(val);
		setItems((prev) =>
			produce(prev, (draft) => {
				draft[index].price = price;
				setItemsLocal(mode, draft);
			})
		);
	};
	const changeQty = (index: number, val: string) => {
		const qty = z.coerce.number().int().catch(1).parse(val);
		setItems((prev) =>
			produce(prev, (draft) => {
				draft[index].qty = qty;
				setItemsLocal(mode, draft);
			})
		);
	};
	const changeDisc = {
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
	};
	const changeFix = (fix: number) => {
		setFix(fix);
	}
	const val = {
		fix,
		items,
		addItem,
		removeItem,
		set: {
			name: changeName,
			barcode: changeBarcode,
			price: changePrice,
			qty: changeQty,
			disc: changeDisc,
			fix: changeFix
		},
	};
	return val;
}

const ItemContext = createContext<null | {
	items: Item[];
	addItem(added: { id: number; price: number; name: string; barcode: string | null }): void;
	removeItem: (index: number) => void;
	fix: number;
	set: {
		name(index: number, val: string): void;
		barcode(index: number, val: string): void;
		price(index: number, val: string): void;
		qty(index: number, val: string): void;
		disc: {
			add(index: number): void;
			remove(itemIndex: number, discIndex: number): void;
			kind(itemIndex: number, discIndex: number, val: string): void;
			value(itemIndex: number, discIndex: number, val: string): void;
		};
		fix: (fix: number) => void
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
		return [];
	}
}

async function getFixLocal(mode: Mode): Promise<number> {
	try {
		const raw = await AsyncStorage.getItem(`${mode}-fix`);
		const num = Number(raw);
		if (raw === null || isNaN(num) || !Number.isInteger(num)) return 0;
		return num;
	} catch (error) {
		console.error(error);
		return 0;
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
