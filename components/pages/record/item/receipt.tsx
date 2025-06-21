import { Await } from "@/components/Await";
import { Show } from "@/components/Show";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useAsync } from "@/hooks/useAsync";
import { useDB } from "@/hooks/useDB";
import { Profile, store } from "@/lib/store";
import { err, formatDate, formatTime, getDayName, METHOD_NAMES, ok, Result } from "@/lib/utils";
// eslint-disable-next-line import/no-named-as-default
import Decimal from "decimal.js";
import { ScrollView, View } from "react-native";
import { ReceiptItem } from "./receipt-item";
import { Button } from "@/components/ui/button";
import { Printer, Share } from "lucide-react-native";
import * as Sharing from "expo-sharing";
import { useRef } from "react";
import { captureRef } from "react-native-view-shot";
import * as Print from "expo-print";

export function Receipt({
	items,
	record,
	additionals,
	discs,
	methods,
}: {
	record: DB.Record;
	items: DB.RecordItem[];
	discs: DB.Discount[];
	additionals: DB.Additional[];
	methods: DB.MethodType[];
}) {
	const info = useInfo();
	const methodType = methods.find((m) => m.id === record.method);
	const methodTypeName =
		methodType === undefined ? "Tunai" : `${METHOD_NAMES[methodType.method]} ${methodType.label}`;
	const totalProductTypes = items.length;
	const totalQty = items.map((i) => i.qty).reduce((prev, curr) => prev + curr);
	const totalAfterDisc = new Decimal(record.total_from_items).sub(record.disc_eff_val);
	const totalAfterAdds = totalAfterDisc.add(record.total_additional);
	const total = totalAfterDisc.add(record.rounding);
	const change = new Decimal(record.pay).sub(total);
	const viewRef = useRef(null);
	const captureAndShare = async () => {
		if (viewRef.current === null) return;
		try {
			const uri = await captureRef(viewRef, {
				format: "png",
				quality: 1, 
			});
			if (!uri) return;
			await Sharing.shareAsync(uri);
		} catch (error) {
			console.error("Error:", error);
		}
	};
	const captureAndPrint = async () => {
		if (viewRef.current === null) return;
		try {
			const base64 = await captureRef(viewRef, {
				format: "png",
				quality: 1,
				result: "base64",
			});
			if (!base64) return;
			const html = `
				<html>
					<body style="margin:0; padding:0; text-align:center;">
						<img src="data:image/png;base64,${base64}" style="max-width:72mm; display:inline-block;" />
					</body>
				</html>
			`;
			await Print.printAsync({ html });
		} catch (error) {
			console.error("Error:", error);
		}
	};
	return (
		<View className="px-1 flex-1 gap-1">
			<ScrollView className="flex-1 gap-5 w-full">
				<Await state={info}>
					{({ profile, socials }) => {
						const headers = profile.header === "" ? [] : profile.header.split("\n");
						const footers = profile.footer === "" ? [] : profile.footer.split("\n");
						return (
							<View
								ref={viewRef}
								collapsable={false}
								className="flex flex-col gap-2 overflow-auto px-2 border border-border pt-5 bg-white"
							>
								<View className="flex flex-col">
									<Text className="text-center text-lg font-bold">{profile.name}</Text>
									{headers.map((h, i) => (
										<Text key={i} className="text-center">
											{h}
										</Text>
									))}
									<Text>{profile.address}</Text>
									<Show when={record.cashier !== null && profile.showCashier === "true"}>
										<Text>Kasir: {record.cashier}</Text>
									</Show>
									<View className="flex flex-row items-center justify-between">
										<Text>No: {record.timestamp}</Text>
										<Text>
											{getDayName(record.timestamp)},{" "}
											{formatDate(record.timestamp, "long").replace(/-/g, "/")},{" "}
											{formatTime(record.timestamp, "long")}
										</Text>
									</View>
								</View>
								<Separator orientation="horizontal" />
								{items.map((item, i) => (
									<ReceiptItem key={i} item={item} discs={discs} index={i} />
								))}
								<Separator orientation="horizontal" />
								<View className="flex items-end">
									<View className="flex flex-col items-end">
										<Show when={record.total_from_items !== total.toNumber()}>
											<View className="flex flex-row gap-1 items-center">
												<Text className="w-[120px]">Subtotal</Text>
												<View className="w-[100px] items-end ">
													<Text>{record.total_from_items.toLocaleString("id-ID")}</Text>
												</View>
											</View>
											<View className="w-[225px]">
												<Separator orientation="horizontal" className="" />
											</View>
										</Show>
										<Show when={record.disc_val > 0}>
											<View className="flex flex-row items-center gap-1">
												<Text className="w-[120px]">
													Diskon{record.disc_kind === "percent" ? ` ${record.disc_val}%` : ""}
												</Text>
												<View className="w-[100px] items-end">
													<Text>{record.disc_eff_val.toLocaleString("id-ID")}</Text>
												</View>
											</View>
											<View className="flex flex-row items-center gap-1">
												<View className="w-[100px] items-end">
													<Text>{totalAfterDisc.toNumber().toLocaleString("id-ID")}</Text>
												</View>
											</View>
											<View className="w-[225px]">
												<Separator orientation="horizontal" className="" />
											</View>
										</Show>
										<Show when={additionals.length > 0}>
											{additionals.map((additional) => (
												<View key={additional.id} className="flex flex-row gap-1 items-center">
													<Text className="w-[120px]">
														{additional.name}
														{additional.kind === "percent" ? ` ${additional.value}%` : ""}
													</Text>
													<View className="w-[100px] items-end">
														<Text>{additional.eff_value.toLocaleString("id-ID")}</Text>
													</View>
												</View>
											))}
											<View className="flex flex-row items-center gap-1">
												<View className="w-[100px] items-end">
													<Text>{totalAfterAdds.toNumber().toLocaleString("id-ID")}</Text>
												</View>
											</View>
											<View className="w-[225px]">
												<Separator orientation="horizontal" className="" />
											</View>
										</Show>
										<Show when={record.rounding > 0}>
											<View className="flex flex-row items-center gap-1">
												<Text className="w-[120px]">Pembulatan</Text>
												<View className="w-[100px] items-end">
													<Text>{record.rounding.toLocaleString("id-ID")}</Text>
												</View>
											</View>
											<View className="w-[225px]">
												<Separator orientation="horizontal" className="" />
											</View>
										</Show>
										<View className="flex flex-row items-center gap-1">
											<Text className="w-[120px]">Total</Text>
											<View className="w-[100px] items-end">
												<Text>{total.toNumber().toLocaleString("id-ID")}</Text>
											</View>
										</View>
										<View className="flex flex-row items-center gap-1">
											<Text className="w-[120px]">Pembayaran</Text>
											<View className="w-[100px] items-end">
												<Text>{record.pay.toLocaleString("id-ID")}</Text>
											</View>
										</View>
										<View className="flex flex-row items-center gap-1">
											<Text className="w-[120px]">Kembalian</Text>
											<View className="w-[100px] items-end">
												<Text>{change.toNumber().toLocaleString("id-ID")}</Text>
											</View>
										</View>
									</View>
								</View>
								<View>
									<Text>
										{totalProductTypes} Jenis/{totalQty} pcs
									</Text>
									<Text>{methodTypeName}</Text>
								</View>
								<View className="flex items-center flex-col">
									{footers.map((h, i) => (
										<Text className="text-center" key={i}>
											{h}
										</Text>
									))}
									{socials.map((s) => (
										<Text key={s.id}>
											{s.name}: {s.value}
										</Text>
									))}
								</View>
							</View>
						);
					}}
				</Await>
			</ScrollView>
			<View className="flex-row items-center justify-around">
				<Button
					onPress={captureAndShare}
					className="flex-1 items-center flex-row gap-2"
					variant="outline"
				>
					<Text>Bagikan</Text>
					<Share />
				</Button>
				<Button onPress={captureAndPrint} className="flex-1 items-center flex-row gap-2">
					<Text>Cetak</Text>
					<Printer color="white" />
				</Button>
			</View>
		</View>
	);
}

const useInfo = () => {
	const db = useDB();
	const info = useAsync(
		async (): Promise<
			Result<
				"Aplikasi bermasalah",
				{
					profile: Profile;
					socials: DB.Social[];
				}
			>
		> => {
			const [[errProfile, profile], [errSocial, socials]] = await Promise.all([
				store.get(),
				db.social.get(),
			]);
			if (errSocial) return err(errSocial);
			if (errProfile) return err(errProfile);
			return ok({ profile, socials });
		}
	);
	return info;
};
