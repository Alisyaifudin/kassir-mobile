import { err, ok, Result } from "@/lib/utils";
import { Additional, Item } from "./use-item";
import { Temporal } from "temporal-polyfill";
// eslint-disable-next-line import/no-named-as-default
import Decimal from "decimal.js";
import { Database } from "@/database";

type Record = {
	round: number;
	fix: number;
	methodId: number | null;
	method: DB.Method;
	pay: number;
	discVal: number;
	paidAt: number | null;
	discKind: DB.DiscKind;
	note: string;
	cashier: string;
};

type ErrorMsg =
	| "Aplikasi bermasalah"
	| "Tidak ada barang"
	| "Ada barang dengan barcode yang sama"
	| "Biaya tambahan harus punya nama"
	| "Produk harus punya nama"
	| "Kuantitas harus lebih dari nol"
	| "Harga tidak boleh negatif"
	| "Biaya tambahan tidak boleh negatif"
	| "Barang sudah ada"
	| "Barang tidak ada";

export async function submit(
	db: Database,
	mode: DB.Mode,
	items: Item[],
	additionals: Additional[],
	record: Record
): Promise<Result<ErrorMsg, number>> {
	if (items.length === 0) {
		return err("Tidak ada barang");
	}
	const timestamp = Temporal.Now.instant().epochMilliseconds;
	const errCheck = check(items, additionals, record);
	if (errCheck) return err(errCheck);
	const { capitals, discEffItems, discs, discEffVal, effAdds, totalAdditional, totalFromItems } =
		calcGrandTotal({
			items,
			additionals,
			fix: record.fix,
			disc: { value: record.discVal, kind: record.discKind },
			rounding: record.round,
		});
	const data = transform(timestamp, items, discEffItems, capitals);
	try {
		await db.raw.withTransactionAsync(async () => {
			await insertRecord(db, mode, {
				...record,
				discEffVal: discEffVal.toNumber(),
				timestamp,
				totalAdditional: totalAdditional.toNumber(),
				totalFromItems: totalFromItems.toNumber(),
			});
			await insertAdditionals(db, timestamp, additionals, effAdds);
			const recordItemsRaw = await insertOrUpdateProduct(db, mode, data);
			const recordItemIds = await insertRecordItems(db, recordItemsRaw, timestamp);
			await insertDiscount(db, recordItemIds, discs);
		});
		return ok(timestamp);
	} catch (error) {
		if (typeof error === "string") {
			switch (error) {
				case "Aplikasi bermasalah":
					return err(error);
				case "Barang sudah ada":
					return err(error);
				case "Barang tidak ada":
					return err(error);
			}
		}
		console.error(error);
		return err("Aplikasi bermasalah");
	}
}

// ############################################################################
// ############################################################################
// ############################################################################
// ############################################################################
// ############################################################################

function calcEffDisc(base: Decimal, disc: { value: number; kind: DB.DiscKind }, fix: number) {
	switch (disc.kind) {
		case "number":
			return new Decimal(disc.value);
		case "percent":
			return new Decimal(base.times(disc.value).div(100).toFixed(fix));
	}
}

function calcItemEffDisc(item: Item, fix: number) {
	const total = new Decimal(item.price).times(item.qty);
	let subtotal = total;
	const effDiscs: number[] = [];
	for (const d of item.discs) {
		const currEff = calcEffDisc(subtotal, d, fix);
		effDiscs.push(currEff.toNumber());
		subtotal = subtotal.sub(currEff);
	}
	return {
		effDisc: total.sub(subtotal),
		discs: item.discs.map((d, i) => ({ kind: d.kind, value: d.value, effValue: effDiscs[i] })),
	};
}

function calcAddEff(totalFromItems: Decimal, additionals: Additional[], fix: number) {
	let subtotal = totalFromItems;
	const effAdds: number[] = [];
	for (const add of additionals) {
		const currEff = calcEffDisc(subtotal, { value: add.value, kind: add.kind }, fix);
		effAdds.push(currEff.toNumber());
		subtotal = subtotal.sub(currEff);
	}
	return { totalAdditional: totalFromItems.sub(subtotal), effAdds };
}

function calcGrandTotal({
	items,
	additionals,
	fix,
	disc,
	rounding,
}: {
	items: Item[];
	additionals: Additional[];
	fix: number;
	disc: { value: number; kind: DB.DiscKind };
	rounding: number;
}) {
	const discEffItems = items.map((item) => {
		const { effDisc, discs } = calcItemEffDisc(item, fix);
		const effTotal = new Decimal(item.price).times(item.qty).sub(effDisc);
		return {
			effDisc: effDisc.toNumber(),
			effTotal,
			qty: item.qty,
			discs,
		};
	});
	const totalFromItems = Decimal.sum(...discEffItems.map((d) => d.effTotal));
	const discEffVal = calcEffDisc(totalFromItems, disc, fix);
	const totalAfterDisc = totalFromItems.sub(discEffVal);
	const { totalAdditional, effAdds } = calcAddEff(totalAfterDisc, additionals, fix);
	const totalAfterAdds = totalAfterDisc.add(totalAdditional);
	const grandTotal = totalAfterAdds.add(rounding);
	const capitalK = grandTotal.div(totalFromItems);
	const capitals = discEffItems.map((item) =>
		Number(item.effTotal.div(item.qty).times(capitalK).toFixed(fix))
	);
	return {
		discEffItems: discEffItems.map((d) => d.effDisc),
		discs: discEffItems.map((d) => d.discs),
		totalFromItems,
		totalAdditional,
		discEffVal,
		capitals,
		effAdds,
	};
}

// 1 | q1 | p1 | sub1 | c1
// 2 | q2 | p2 | sub2 | c2
// 3 | q3 | p3 | sub3 | c3

// c = k*p

// sum(c) = grand
// sum(c1*q1+c2*q2+c3*q3) = grand
// k*sum(p1*q1+p2*q2+p3*q3) = grand
// k = grand/sum(p1*q1+p2*q2+p3*q3)

function check(items: Item[], additionals: Additional[], record: Record): ErrorMsg | null {
	const barcodes = items.filter((item) => item.barcode !== null).map((i) => i.barcode);
	const uniqueBarcodes = new Set(barcodes);
	if (barcodes.length > uniqueBarcodes.size) {
		return "Ada barang dengan barcode yang sama";
	}
	const emptyAdd = additionals.find((add) => add.name.trim() === "");
	if (emptyAdd !== undefined) {
		return "Biaya tambahan harus punya nama";
	}
	const emptyItem = items.find((item) => item.name.trim() === "");
	if (emptyItem !== undefined) {
		return "Produk harus punya nama";
	}
	for (const item of items) {
		if (item.qty <= 0) {
			return "Kuantitas harus lebih dari nol";
		}
		if (item.price < 0) {
			return "Harga tidak boleh negatif";
		}
		if (item.capitals.length === 0) {
			console.error("No capitals?");
			return "Aplikasi bermasalah";
		}
	}
	for (const add of additionals) {
		if (add.value < 0) {
			return "Biaya tambahan tidak boleh negatif";
		}
	}
	return null;
}

function transform(timestamp: number, items: Item[], discEffItems: number[], capitals: number[]) {
	const data = items.map(
		(
			item,
			i
		): {
			item: Omit<DB.RecordItem, "id" | "product_id">;
			product: {
				id: number | null;
				barcode: string | null;
				capitals: {
					id: number;
					value: number;
					stock: number;
				}[];
			};
			capital: number;
			qty: number;
		} => {
			const discEffVal = discEffItems[i];
			const capital = capitals[i];
			return {
				item: {
					timestamp,
					name: item.name.trim(),
					price: item.price,
					disc_val: discEffVal,
				},
				product: {
					id: item.id ?? null,
					barcode: item.barcode ?? null,
					capitals: item.capitals,
				},
				capital,
				qty: item.qty,
			};
		}
	);
	return data;
}

async function insertRecord(
	db: Database,
	mode: DB.Mode,
	{
		paidAt,
		discKind,
		discVal,
		cashier,
		method,
		methodId,
		note,
		pay,
		round,
		discEffVal,
		timestamp,
		totalAdditional,
		totalFromItems,
	}: Record & {
		timestamp: number;
		discEffVal: number;
		totalAdditional: number;
		totalFromItems: number;
	}
) {
	const errRecord = await db.record.add(mode, timestamp, {
		paid_at: paidAt,
		disc_eff_val: discEffVal,
		disc_kind: discKind,
		disc_val: discVal,
		method,
		note,
		pay,
		rounding: round,
		timestamp,
		total_additional: totalAdditional,
		total_from_items: totalFromItems,
		cashier,
		method_id: methodId,
	});
	if (errRecord) {
		console.error("Failed to insert to `records`");
		throw errRecord;
	}
}

async function insertAdditionals(
	db: Database,
	timestamp: number,
	additionals: Additional[],
	effAdds: number[]
) {
	const [errAdds] = await db.additional.addMany(
		additionals.map((add, i) => ({
			eff_value: effAdds[i],
			kind: add.kind,
			name: add.name,
			value: add.value,
		})),
		timestamp
	);
	if (errAdds) {
		console.error("Failed to insert to `additionals`");
		throw errAdds;
	}
}

async function insertOrUpdateProduct(
	db: Database,
	mode: DB.Mode,
	data: {
		item: Omit<DB.RecordItem, "id" | "product_id">;
		product: {
			id: number | null;
			barcode: string | null;
			capitals: {
				id: number;
				value: number;
				stock: number;
			}[];
		};
		qty: number;
		capital: number;
	}[]
): Promise<(Omit<DB.RecordItem, "id"> & { capitals: { qty: number; value: number }[] })[]> {
	const productPromises: Promise<
		Result<
			"Aplikasi bermasalah" | "Barang sudah ada" | "Barang tidak ada",
			Omit<DB.RecordItem, "id"> & { capitals: { qty: number; value: number }[] }
		>
	>[] = [];
	data.forEach(({ item, product, qty, capital }) => {
		switch (mode) {
			case "buy": {
				productPromises.push(insertBuy(db, item, product, qty, capital));
			}
			case "sell": {
				productPromises.push(insertSell(db, item, product, qty));
			}
		}
	});
	const res = await Promise.all(productPromises);
	const recordItems: (Omit<DB.RecordItem, "id"> & {
		capitals: { qty: number; value: number }[];
	})[] = [];
	for (const [errMsg, recordItem] of res) {
		if (errMsg) {
			console.error("Failed to insertOrUpdateProduct: ", errMsg);
			throw errMsg;
		}
		recordItems.push(recordItem);
	}
	return recordItems;
}

async function insertBuy(
	db: Database,
	item: Omit<DB.RecordItem, "id" | "product_id">,
	product: {
		id: number | null;
		barcode: string | null;
		capitals: {
			id: number;
			value: number;
			stock: number;
		}[];
	},
	qty: number,
	capital: number
): Promise<
	Result<
		"Aplikasi bermasalah" | "Barang tidak ada" | "Barang sudah ada",
		Omit<DB.RecordItem, "id"> & { capitals: { qty: number; value: number }[] }
	>
> {
	if (product.id) {
		const errMsg = await db.productCapital.buy({
			capital,
			id: product.id,
			qty,
		});
		if (errMsg) return err(errMsg);
		return ok({ ...item, product_id: product.id, capitals: [{ qty, value: capital }] });
	} else {
		const [errMsg, id] = await db.product.insert({
			barcode: product.barcode,
			capital,
			stock: product.capitals[0].stock,
			name: item.name,
			note: "",
			price: item.price,
		});
		if (errMsg) return err(errMsg);
		return ok({ ...item, product_id: id, capitals: [{ qty, value: 0 }] });
	}
}

async function insertSell(
	db: Database,
	item: Omit<DB.RecordItem, "id" | "product_id">,
	product: {
		id: number | null;
		barcode: string | null;
		capitals: {
			id: number;
			value: number;
			stock: number;
		}[];
	},
	quantity: number
): Promise<
	Result<
		"Aplikasi bermasalah" | "Barang tidak ada" | "Barang sudah ada",
		Omit<DB.RecordItem, "id"> & { capitals: { qty: number; value: number }[] }
	>
> {
	if (product.id) {
		const recordItem: Omit<DB.RecordItem, "id"> & { capitals: { qty: number; value: number }[] } = {
			...item,
			product_id: product.id,
			capitals: [],
		};
		let qty = quantity;
		for (const capital of product.capitals) {
			if (qty <= 0) break;
			if (qty < capital.stock) {
				await db.productCapital.sell({
					capitalId: capital.id,
					delete: false,
					qty,
				});
				recordItem.capitals.push({ qty, value: capital.value });
				qty = 0;
			} else if (capital.id === product.capitals[product.capitals.length - 1].id) {
				await db.productCapital.sell({
					capitalId: capital.id,
					delete: false,
					qty: capital.stock,
				});
				recordItem.capitals.push({ qty: capital.stock, value: capital.value });
				qty = 0;
			} else {
				await db.productCapital.sell({
					delete: true,
					capitalId: capital.id,
				});
				recordItem.capitals.push({ qty: capital.stock, value: capital.value });
				qty -= capital.stock;
			}
		}
		return ok(recordItem);
	} else {
		const [errMsg, id] = await db.product.insert({
			barcode: product.barcode,
			capital: 0,
			stock: product.capitals[0].stock,
			name: item.name,
			note: "",
			price: item.price,
		});
		if (errMsg) return err(errMsg);
		const recordItem: Omit<DB.RecordItem, "id"> & {
			capitals: { qty: number; value: number }[];
		} = {
			...item,
			product_id: id,
			capitals: [
				{
					qty: product.capitals[0].stock,
					value: 0,
				},
			],
		};
		return ok(recordItem);
	}
}

async function insertRecordItems(
	db: Database,
	items: (Omit<DB.RecordItem, "id" | "timestamp"> & {
		capitals: { qty: number; value: number }[];
	})[],
	timestamp: number
): Promise<number[]> {
	const [errItems, recordItemIds] = await db.recordItem.addMany(items, timestamp);
	if (errItems) {
		console.error("Failed to insert record item");
		throw errItems;
	}
	return recordItemIds;
}

async function insertDiscount(
	db: Database,
	recordItemIds: number[],
	discs: {
		kind: "number" | "percent";
		value: number;
		effValue: number;
	}[][]
) {
	const discPromises: Promise<"Aplikasi bermasalah" | null>[] = [];
	recordItemIds.forEach((id, i) => {
		const ds = discs[i];
		if (ds.length > 0) {
			discPromises.push(db.discount.addMany(id, ds));
		}
	});
	const resDisc = await Promise.all(discPromises);
	for (const errMsg of resDisc) {
		if (errMsg !== null) {
			console.error("Failed to insert discounts");
			throw errMsg;
		}
	}
}
