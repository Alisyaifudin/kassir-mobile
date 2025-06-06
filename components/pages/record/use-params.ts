import { integer } from "@/lib/utils";
import { useLocalSearchParams } from "expo-router";
import { Temporal } from "temporal-polyfill";
import { z } from "zod";

export function useTime() {
	const tz = Temporal.Now.timeZoneId();
	const today = Temporal.Now.instant();
	const { time: raw } = useLocalSearchParams<{ time?: string }>();
	const time = integer.catch(today.epochMilliseconds).parse(raw);
	const start = Temporal.Instant.fromEpochMilliseconds(time).toZonedDateTimeISO(tz).startOfDay();
	const end = start.add(Temporal.Duration.from({ days: 1 }));
	return { start: start.epochMilliseconds, end: end.epochMilliseconds };
}

export function useTab() {
	const { tab: raw } = useLocalSearchParams<{ tab?: string }>();
	const tab = z.enum(["sell", "buy"]).catch("sell").parse(raw);
	return tab;
}

export function useMethod() {
	const params = useLocalSearchParams<{ id?: string; type?: string }>();
	const parsedType = z.enum(["cash", "transfer", "debit", "qris"]).safeParse(params.type);
	const parsedId = integer.safeParse(params.id);
	if (!parsedType.success) {
		return null;
	}
	const type = parsedType.data;
	if (!parsedId.success) {
		return {
			type,
			id: null,
		};
	}
	const id = parsedId.data;
	return {
		type,
		id,
	};
}
