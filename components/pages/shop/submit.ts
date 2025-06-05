import { err, ok, Result } from "@/lib/utils";
import { Additional, Item } from "./use-item";
import { Temporal } from "temporal-polyfill";
// eslint-disable-next-line import/no-named-as-default
import Decimal from "decimal.js";
import { Database } from "@/database";

export async function submit(
	db: Database,
	mode: Mode,
	items: Item[],
	additionals: Additional[],
	record: {
		fix: number;
		round: number;
		method: number | null;
		pay: number;
		discVal: number;
		credit: 0 | 1;
		discKind: DiscKind;
		note: string;
		cashier: string;
	}
): Promise<
	Result<
		| "Aplikasi bermasalah"
		| "Tidak ada barang"
		| "Ada barang dengan barcode yang sama"
		| "Biaya tambahan harus punya nama"
		| "Produk harus punya nama"
		| "Kuantitas harus lebih dari nol"
		| "Harga tidak boleh negatif"
		| "Biaya tambahan tidak boleh negatif"
		| "Barang sudah ada",
		number
	>
> {
	if (items.length === 0) {
		return err("Tidak ada barang");
	}
	const timestamp = Temporal.Now.instant().epochMilliseconds;
	const barcodes = items.filter((item) => item.barcode !== null).map((i) => i.barcode);
	const uniqueBarcodes = new Set(barcodes);
	if (barcodes.length > uniqueBarcodes.size) {
		return err("Ada barang dengan barcode yang sama");
	}
	const emptyAdd = additionals.find((add) => add.name.trim() === "");
	if (emptyAdd !== undefined) {
		return err("Biaya tambahan harus punya nama");
	}
	const emptyItem = items.find((item) => item.name.trim() === "");
	if (emptyItem !== undefined) {
		return err("Produk harus punya nama");
	}
	for (const item of items) {
		if (item.qty <= 0) {
			return err("Kuantitas harus lebih dari nol");
		}
		if (item.price < 0) {
			return err("Harga tidak boleh negatif");
		}
	}
	for (const add of additionals) {
		if (add.value < 0) {
			return err("Biaya tambahan tidak boleh negatif");
		}
	}
	const { capitals, discEffItems, discs, discEffVal, effAdds, totalAdditional, totalFromItems } =
		calcGrandTotal({
			items,
			additionals,
			fix: record.fix,
			disc: { value: record.discVal, kind: record.discKind },
			rounding: record.round,
		});
	const itemsTranform = items.map((item, i) => {
		const discEffVal = discEffItems[i];
		const capital = mode === "sell" ? 0 : capitals[i];
		return {
			item: {
				timestamp,
				name: item.name.trim(),
				price: item.price,
				qty: item.qty,
				disc_val: discEffVal,
				capital,
			},
			product: {
				id: item.id ?? null,
				stock: mode === "buy" ? Number(item.qty) : item.stock ?? Number(item.qty),
				barcode: item.barcode ?? null,
			},
		};
	});
	try {
		await db.raw.withTransactionAsync(async () => {
			const errRecord = await db.record.add(mode, timestamp, {
				credit: record.credit,
				disc_eff_val: discEffVal.toNumber(),
				disc_kind: record.discKind,
				disc_val: record.discVal,
				method: record.method,
				note: record.note,
				pay: record.pay,
				rounding: record.round,
				timestamp,
				total_additional: totalAdditional.toNumber(),
				total_from_items: totalFromItems.toNumber(),
				cashier: record.cashier,
			});
			if (errRecord) {
				console.error("Failed to insert to `records`");
				throw errRecord;
			}
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
			const productPromises: Promise<Result<"Aplikasi bermasalah" | "Barang sudah ada", number>>[] =
				[];
			itemsTranform.forEach(({ item, product }, i) => {
				if (product.id) {
					productPromises.push(
						(async () => {
							await db.product.update(mode, {
								id: product.id!,
								qty: item.qty,
							});
							return ok(product.id!);
						})()
					);
				} else {
					productPromises.push(
						db.product.insert({
							barcode: product.barcode,
							capital: item.capital,
							name: item.name,
							note: "",
							price: item.price,
							stock: product.stock,
						})
					);
				}
			});
			const resProduct = await Promise.all(productPromises);
			for (const [errMsg] of resProduct) {
				if (errMsg !== null) {
					console.error("Failed to insert/update product");
					throw errMsg;
				}
			}
			const recordItems: Omit<DB.RecordItem, "id" | "timestamp">[] = [];
			itemsTranform.forEach(({ item, product }, i) => {
				if (product.id === null) {
					const productId = resProduct[i][1];
					if (productId === null) {
						console.error("No product Id when trying to insert record item");
						throw "Aplikasi bermasalah";
					}
					recordItems.push({ ...item, product_id: productId });
				} else {
					recordItems.push({ ...item, product_id: product.id });
				}
			});
			const [errItems, recordItemIds] = await db.recordItem.addMany(recordItems, timestamp);
			if (errItems) {
				console.error("Failed to insert record item");
				throw errItems;
			}
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
		});
		return ok(timestamp);
	} catch (error) {
		if (typeof error === "string") {
			switch (error) {
				case "Aplikasi bermasalah":
					return err(error);
				case "Barang sudah ada":
					return err(error);
			}
		}
		console.error(error);
		return err("Aplikasi bermasalah");
	}
}

function calcEffDisc(base: Decimal, disc: { value: number; kind: DiscKind }, fix: number) {
	switch (disc.kind) {
		case "number":
			return new Decimal(disc.value);
		case "percent":
			const val = base.times(disc.value).div(100).toFixed(fix);
			return base.sub(val);
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
	disc: { value: number; kind: DiscKind };
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
	const { totalAdditional, effAdds } = calcAddEff(totalFromItems, additionals, fix);
	const subtotal = totalFromItems.add(totalAdditional);
	const discEffVal = calcEffDisc(subtotal, disc, fix);
	const grandTotal = subtotal.sub(discEffVal).add(rounding);
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
