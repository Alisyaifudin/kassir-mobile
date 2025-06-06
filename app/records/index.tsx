import { Await } from "@/components/Await";
import { Card } from "@/components/pages/record/card";
import { Nav } from "@/components/pages/record/nav";
import { useMethod, useTab, useTime } from "@/components/pages/record/use-params";
import { TopNav } from "@/components/TopNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { useAsyncDep } from "@/hooks/useAsyncDep";
import { useDB } from "@/hooks/useDB";
import { useEmitter } from "@/hooks/useEmitter";
import { emitter } from "@/lib/event-emitter";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, FlatList, RefreshControl, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = ["sell", "buy"] as const;
const tabName = {
	sell: "Jual",
	buy: "Beli",
} as const;

type MethodIds = {
	transfer: number[];
	debit: number[];
	qris: number[];
};

export default function DetailScreen() {
	const { start, end } = useTime();
	const tab = useTab();
	const method = useMethod();
	const [methods, setMethods] = useState<DB.MethodType[]>([]);
	const methodIds: MethodIds = useMemo(() => {
		return {
			transfer: methods.filter((m) => m.method === "transfer").map((m) => m.id),
			debit: methods.filter((m) => m.method === "debit").map((m) => m.id),
			qris: methods.filter((m) => m.method === "qris").map((m) => m.id),
		};
	}, [methods]);
	const state = useRecord(start, end);
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);
	const handleRefresh = useCallback(() => {
		setRefreshing(true);
		emitter.emit("fetch-records");
	}, []);
	useEffect(() => {
		if (!state.loading) {
			setRefreshing(false);
		}
	}, [state]);
	return (
		<SafeAreaView style={styles.container}>
			<TopNav>Riwayat</TopNav>
			<Nav start={start} setMethods={setMethods} />
			<View className="p-2 flex-1">
				<Await state={state}>
					{(records) => {
						return (
							<Tabs
								value={tab}
								onValueChange={(tab) => {
									router.setParams({
										tab,
									});
								}}
								className="w-full max-w-full mx-auto flex-col flex-1"
							>
								<TabsList className="flex-row w-full">
									{TABS.map((tab) => (
										<TabsTrigger key={tab} value={tab} className="flex-1">
											<Text>{tabName[tab]}</Text>
										</TabsTrigger>
									))}
								</TabsList>
								{TABS.map((tab) => {
									const data = records
										.filter((r) => r.mode === tab)
										.filter((r) => {
											if (method === null) {
												return true;
											}
											if (method.id === null) {
												if (method.type === "cash") return r.method === null;
												if (r.method === null) return false;
												return methodIds[method.type].includes(r.method);
											}
											return method.id === r.method;
										});
									return (
										<TabsContent key={tab} value={tab} className="flex-1">
											<FlatList
												data={data}
												keyExtractor={(item) => item.timestamp.toString()}
												renderItem={({ item, index }) => <Card record={item} index={index} />}
												refreshControl={
													<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
												}
											/>
										</TabsContent>
									);
								})}
							</Tabs>
						);
					}}
				</Await>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 5,
	},
});

function useRecord(start: number, end: number) {
	const db = useDB();
	const update = useEmitter("fetch-records", []);
	const state = useAsyncDep(() => db.record.getByRange(start, end), [start, update]);
	return state;
}
