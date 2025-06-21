import { Await } from "@/components/Await";
import { Receipt } from "@/components/pages/record/item/receipt";
import { TopNav } from "@/components/TopNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { useAsync } from "@/hooks/useAsync";
import { useDB } from "@/hooks/useDB";
import { err, integer, ok, Result } from "@/lib/utils";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page() {
	const { timestamp: raw } = useLocalSearchParams<{ timestamp: string }>();
	const parsed = integer.safeParse(raw);
	if (!parsed.success) {
		return <Redirect href="/records" />;
	}
	const timestamp = parsed.data;
	return (
		<SafeAreaView className="flex-1 gap-1">
			<TopNav>Riwayat Barang</TopNav>
			<Wrapper timestamp={timestamp} />
		</SafeAreaView>
	);
}

function Wrapper({ timestamp }: { timestamp: number }) {
	const state = useData(timestamp);
	const [tab, setTab] = useState<"receipt" | "detail">("receipt");
	return (
		<Await state={state}>
			{({ adds, discs, items, record, methods }) => {
				return (
					<Tabs
						value={tab}
						onValueChange={(tab) => setTab(tab as any)}
						className="w-full max-w-full mx-auto flex-col flex-1"
					>
						<TabsList className="flex-row w-full">
							<TabsTrigger value="receipt" className="flex-1">
								<Text>Struk</Text>
							</TabsTrigger>
							<TabsTrigger value="detail" className="flex-1">
								<Text>Detail</Text>
							</TabsTrigger>
						</TabsList>
						<TabsContent value="receipt" className="flex-1">
							<Receipt
								additionals={adds}
								discs={discs}
								items={items}
								methods={methods}
								record={record}
							/>
						</TabsContent>
						<TabsContent value="detail" className="flex-1">
							<Text>Uwu</Text>
						</TabsContent>
					</Tabs>
				);
			}}
		</Await>
	);
}

function useData(timestamp: number) {
	const db = useDB();
	const state = useAsync(
		async (): Promise<
			Result<
				"Aplikasi bermasalah" | "Catatan tidak ada",
				{
					record: DB.Record;
					items: DB.RecordItem[];
					adds: DB.Additional[];
					discs: DB.Discount[];
					methods: DB.MethodType[];
				}
			>
		> => {
			const [
				[errRecord, record],
				[errItems, items],
				[errAdd, adds],
				[errDisc, discs],
				[errMethods, methods],
			] = await Promise.all([
				db.record.getByTime(timestamp),
				db.recordItem.getAllByTime(timestamp),
				db.additional.getAllByTime(timestamp),
				db.discount.getAllByTime(timestamp),
				db.method.get(),
			]);
			if (errAdd) return err(errAdd);
			if (errMethods) return err(errMethods);
			if (errDisc) return err(errDisc);
			if (errRecord) return err(errRecord);
			if (errItems) return err(errItems);
			return ok({
				record,
				items,
				adds,
				discs,
				methods,
			});
		}
	);
	return state;
}
