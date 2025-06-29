import { Temporal } from "temporal-polyfill";
import { z } from "zod";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const version = "2.12.5";

export const METHODS = ["cash", "transfer", "debit", "qris"] as const;
export type Method = (typeof METHODS)[number];
export const METHOD_NAMES = {
	cash: "Tunai",
	transfer: "Transfer",
	debit: "Debit",
	qris: "QRIS",
} as const;

// export const log = logTauri;

export const numerish = z
	.string()
	.refine((val) => val !== "", {
		message: "Harus ada",
	})
	.refine((val) => !isNaN(Number(val)), { message: "Harus angka" });

export const numeric = numerish.transform((val) => Number(val));

export const integer = z
	.string()
	.refine((val) => val !== "", {
		message: "Harus ada",
	})
	.refine((val) => !isNaN(Number(val)), { message: "Harus angka" })
	.transform((val) => Number(val))
	.refine((v) => Number.isInteger(v), { message: "Harus bulat" });

export type Result<E, T> = [E, null] | [null, T];

export function err<T>(value: T): [T, null] {
	return [value, null];
}

export function ok<T>(value: T): [null, T] {
	return [null, value];
}

// First, define the default message type and value
const DEFAULT_MESSAGE = "Aplikasi bermasalah" as const;
type DefaultMessage = typeof DEFAULT_MESSAGE;

// Modified function with default type parameter
export async function tryResult<R, const T = DefaultMessage>({
	run,
	message = DEFAULT_MESSAGE as T,
}: {
	run: (...arg: any[]) => Promise<R>;
	message?: T;
}): Promise<Result<T, R>> {
	try {
		return ok(await run());
	} catch (error) {
		console.error(error);
		return err(message);
	}
}

export const monthNames = {
	1: "Januari",
	2: "Februari",
	3: "Maret",
	4: "April",
	5: "Mei",
	6: "Juni",
	7: "Juli",
	8: "Agustus",
	9: "September",
	10: "Oktober",
	11: "November",
	12: "Desember",
} as Record<number, string>;

export const dayNames = {
	1: "Senin",
	2: "Selasa",
	3: "Rabu",
	4: "Kamis",
	5: "Jumat",
	6: "Sabtu",
	7: "Minggu",
} as Record<number, string>;

export function getDayName(epochMilli: number) {
	const tz = Temporal.Now.timeZoneId();
	const date = Temporal.Instant.fromEpochMilliseconds(epochMilli).toZonedDateTimeISO(tz);
	return dayNames[date.dayOfWeek];
}

export function formatDate(epochMilli: number, type: "short" | "long" = "short"): string {
	const tz = Temporal.Now.timeZoneId();
	const date = Temporal.Instant.fromEpochMilliseconds(epochMilli).toZonedDateTimeISO(tz);
	const { day, month, year } = date;
	switch (type) {
		case "short":
			return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
		case "long":
			return `${day} ${monthNames[month]} ${year}`;
	}
}

export const dateStringSchema = z.string().regex(
	/^\d+-\d{2}-\d{2}$/, // Regular expression to match any number of digits for the year, followed by MM-DD
	"Tanggal tidak valid"
);

export function formatTime(epochMilli: number, format: "long" | "short" = "short"): string {
	const tz = Temporal.Now.timeZoneId();
	const date = Temporal.Instant.fromEpochMilliseconds(epochMilli).toZonedDateTimeISO(tz);
	const { hour, minute, second } = date;
	switch (format) {
		case "long":
			return `${hour}:${minute.toString().padStart(2, "0")}:${second.toString().padStart(2, "0")}`;
		case "short":
			return `${hour}:${minute.toString().padStart(2, "0")}`;
	}
}

export function dateToEpoch(date: string): number {
	const [year, month, day] = date.split("-").map(Number);
	const tz = Temporal.Now.timeZoneId();
	const t = Temporal.ZonedDateTime.from({ timeZone: tz, year, month, day }).startOfDay()
		.epochMilliseconds;
	return t;
}

// export function getBackURL(defaultURL: string, search: URLSearchParams) {
// 	const parsed = z.string().safeParse(search.get("url_back"));
// 	const urlBack = parsed.success ? parsed.data : defaultURL;
// 	return urlBack;
// }

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function foldMap<T>(array: T[], chunkSize: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
}
