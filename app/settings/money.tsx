import React, { useEffect, useMemo, useState } from "react";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "@/components/TopNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Temporal } from "temporal-polyfill";
import { useDB } from "@/hooks/useDB";
import { Await } from "@/components/Await";
import { MoneyList } from "@/components/pages/settings/money/list";
import { Calendar } from "@/components/Calendar";
import { View } from "react-native";
import { emitter } from "@/lib/event-emitter";
import { useAsyncDep } from "@/hooks/useAsyncDep";

export default function Page() {
	const [tab, setTab] = useState<DB.MoneyKind>("saving");
	const methods = ["saving", "debt"] as const;
	const tz = Temporal.Now.timeZoneId();
	const now = Temporal.Now.instant().toZonedDateTimeISO(tz).startOfDay();
	const startOfMonth = Temporal.ZonedDateTime.from({
		timeZone: tz,
		year: now.year,
		month: now.month,
		day: 1,
	});

	const [start, setStart] = useState(startOfMonth);
	const end = useMemo(() => {
		const end = start.add(Temporal.Duration.from({ months: 1 })).epochMilliseconds;
		return end;
	}, [start]);
	const handleChangeTime = (v: number) => {
		const time = Temporal.Instant.fromEpochMilliseconds(v).toZonedDateTimeISO(tz).startOfDay();
		const startOfMonth = Temporal.ZonedDateTime.from({
			timeZone: tz,
			year: time.year,
			month: time.month,
			day: 1,
		});
		setStart(startOfMonth);
	};
	const state = useMoney(start.epochMilliseconds, end);
	return (
		<SafeAreaView className="flex-1">
			<TopNav>Uang</TopNav>
			<View className="p-2 flex-1">
				<Calendar time={start.epochMilliseconds} onChange={handleChangeTime} mode="month" />
				<Await state={state}>
					{(money) => (
						<Tabs
							value={tab}
							onValueChange={(v) => setTab(v as any)}
							className="w-full max-w-full mx-auto flex-col gap-1.5 flex-1"
						>
							<TabsList className="flex-row w-full">
								<TabsTrigger value="saving" className="flex-1">
									<Text>Simpanan</Text>
								</TabsTrigger>
								<TabsTrigger value="debt" className="flex-1">
									<Text>Utang</Text>
								</TabsTrigger>
							</TabsList>
							{methods.map((method) => (
								<TabsContent key={method} value={method} className="flex-1">
									<MoneyList kind={method} money={money.filter((m) => m.kind === method)} />
								</TabsContent>
							))}
						</Tabs>
					)}
				</Await>
			</View>
		</SafeAreaView>
	);
}

function useMoney(start: number, end: number) {
	const db = useDB();
	const [update, setUpdate] = useState(false);
	useEffect(() => {
		const listener = () => setUpdate((prev) => !prev);
		emitter.on("fetch-money", listener);
		return () => {
			emitter.off("fetch-money", listener);
		};
	}, []);
	const state = useAsyncDep(() => db.money.get(start, end), [start, update]);
	return state;
}
