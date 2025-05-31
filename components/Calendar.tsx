import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
	DialogFooter,
	DialogTitle,
} from "./ui/dialog";
import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react-native";
import { cn, foldMap, formatDate, monthNames, numeric } from "@/lib/utils";
import { Temporal } from "temporal-polyfill";
import { Input } from "./ui/input";
import { Text } from "./ui/text";
import { View } from "react-native";

export function Calendar({
	time,
	onChange,
	mode: modeInit = "day",
	children,
	className,
}: {
	time: number;
	onChange: (time: number) => void;
	mode?: "day" | "month" | "year";
	children?: React.ReactNode;
	className?: string;
}) {
	const [mode, setMode] = useState<"day" | "month" | "year">(modeInit);
	const changeMode = (mode: "day" | "month" | "year") => {
		switch (modeInit) {
			case "year":
				break;
			case "month":
				if (mode === "day") setMode("month");
				else setMode(mode);
				break;
			case "day":
				setMode(mode);
		}
	};
	const [open, setOpen] = useState(false);
	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				setMode(modeInit);
				setOpen(open);
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className={cn("flex flex-row items-center gap-2 outline", className)}
				>
					{children === undefined ? <CalendarLabel mode={modeInit} time={time} /> : children}
					<CalendarDays />
				</Button>
			</DialogTrigger>
			<Content
				mode={mode}
				depth={modeInit}
				time={time}
				setTime={(time) => {
					onChange(time);
					setOpen(false);
				}}
				changeMode={changeMode}
			/>
		</Dialog>
	);
}

function CalendarLabel({ time, mode }: { time: number; mode?: "day" | "month" | "year" }) {
	const tz = Temporal.Now.timeZoneId();
	const date = Temporal.Instant.fromEpochMilliseconds(time).toZonedDateTimeISO(tz);
	switch (mode) {
		case "day":
			return <Text className="font-normal">{formatDate(time).replace(/-/g, "/")}</Text>;
		case "month":
			return (
				<Text className="font-normal">
					{monthNames[date.month]} {date.year}
				</Text>
			);
		case "year":
			return <Text className="font-normal">{date.year}</Text>;
	}
}

function Content({
	mode,
	time,
	depth,
	setTime,
	changeMode,
}: {
	mode: "day" | "month" | "year";
	depth: "day" | "month" | "year";
	time: number;
	setTime: (time: number) => void;
	changeMode: (mode: "day" | "month" | "year") => void;
}) {
	const tz = Temporal.Now.timeZoneId();

	const timeStartOfDay = Temporal.Instant.fromEpochMilliseconds(time)
		.toZonedDateTimeISO(tz)
		.startOfDay();
	const [showTime, setShowTime] = useState(time);
	const [year, setYear] = useState(timeStartOfDay.year.toString());
	const date = Temporal.Instant.fromEpochMilliseconds(showTime).toZonedDateTimeISO(tz).startOfDay();
	const today = Temporal.Now.instant().toZonedDateTimeISO(tz).startOfDay();
	switch (mode) {
		case "day": {
			const startOfMonth = Temporal.ZonedDateTime.from({
				timeZone: tz,
				year: date.year,
				month: date.month,
				day: 1,
			});
			const deltaStart = startOfMonth.dayOfWeek - 1;
			const start = startOfMonth.subtract(Temporal.Duration.from({ days: deltaStart }));
			const endOfMonth = startOfMonth.add(
				Temporal.Duration.from({ days: startOfMonth.daysInMonth - 1 })
			);
			const deltaEnd = 7 - endOfMonth.dayOfWeek;
			const end = endOfMonth.add(Temporal.Duration.from({ days: deltaEnd + 1 }));
			const days: [number, number, boolean][] = [];
			for (
				let curr = start;
				curr.epochMilliseconds < end.epochMilliseconds;
				curr = curr.add(Temporal.Duration.from({ days: 1 }))
			) {
				const inside =
					curr.epochMilliseconds >= startOfMonth.epochMilliseconds &&
					curr.epochMilliseconds <= endOfMonth.epochMilliseconds;
				days.push([curr.day, curr.epochMilliseconds, inside]);
			}
			const handlePrev = () => {
				const t = startOfMonth.subtract(Temporal.Duration.from({ months: 1 }));
				setShowTime(t.epochMilliseconds);
				setYear(t.year.toString());
			};
			const handleNext = () => {
				const t = startOfMonth.add(Temporal.Duration.from({ months: 1 }));
				setShowTime(t.epochMilliseconds);
				setYear(t.year.toString());
			};
			return (
				<DialogContent>
					<DialogHeader>
						<View className="flex flex-row items-center gap-2 px-1">
							<Button onPress={handlePrev} className="p-0 native:p-0 px-2">
								<ChevronLeft color="white" size={30} />
							</Button>
							<Button variant="secondary" onPress={() => changeMode("month")}>
								<DialogTitle className="text-3xl">
									{monthNames[date.month]} {date.year}
								</DialogTitle>
							</Button>
							<Button onPress={handleNext} className="p-0 native:p-0 px-2">
								<ChevronRight color="white" size={30} />
							</Button>
						</View>
					</DialogHeader>
					<View className="flex gap-1">
						<View className="flex-row gap-1">
							<View className="w-[13%] flex items-center justify-center">
								<Text className="text-xl">Sen</Text>
							</View>
							<View className="w-[13%] flex items-center justify-center">
								<Text className="text-xl">Sel</Text>
							</View>
							<View className="w-[13%] flex items-center justify-center">
								<Text className="text-xl">Rab</Text>
							</View>
							<View className="w-[13%] flex items-center justify-center">
								<Text className="text-xl">Kam</Text>
							</View>
							<View className="w-[13%] flex items-center justify-center">
								<Text className="text-xl">Jum</Text>
							</View>
							<View className="w-[13%] flex items-center justify-center">
								<Text className="text-xl">Sab</Text>
							</View>
							<View className="w-[13%] flex items-center justify-center">
								<Text className="text-xl">Min</Text>
							</View>
						</View>
						{foldMap(days, 7).map((days, i) => (
							<View key={i} className="flex-row gap-1">
								{days.map(([day, epoch, inside]) => (
									<Button
										key={epoch}
										variant={
											epoch === timeStartOfDay.epochMilliseconds
												? "default"
												: epoch === today.epochMilliseconds
												? "outline"
												: "ghost"
										}
										className={cn("justify-center items-center w-[13%] px-0  native:px-0")}
										onPress={() => {
											setShowTime(epoch);
											setTime(epoch);
											const y =
												Temporal.Instant.fromEpochMilliseconds(epoch).toZonedDateTimeISO(tz).year;
											setYear(y.toString());
										}}
									>
										<Text
											className={cn(
												"text-xl native:text-xl",
												inside
													? ""
													: epoch === timeStartOfDay.epochMilliseconds
													? "zinc-100"
													: "text-zinc-500"
											)}
										>
											{day}
										</Text>
									</Button>
								))}
							</View>
						))}
					</View>
					<DialogFooter className="flex justify-center items-end">
						<Button
							variant="outline"
							onPress={() => {
								setTime(today.epochMilliseconds);
								setShowTime(today.epochMilliseconds);
							}}
						>
							<Text>Hari Ini</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			);
		}
		case "month": {
			const handleClick = (month: number) => {
				const t = Temporal.ZonedDateTime.from({ timeZone: tz, year: date.year, month, day: 1 });
				if (depth === "month") {
					setTime(t.epochMilliseconds);
				} else {
					setShowTime(t.epochMilliseconds);
					changeMode("day");
				}
				setYear(t.year.toString());
			};
			const months = [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"Mei",
				"Jun",
				"Jul",
				"Agu",
				"Sep",
				"Okt",
				"Nov",
				"Des",
			];
			const handlePrev = () => {
				const t = date.subtract(Temporal.Duration.from({ years: 1 }));
				setShowTime(t.epochMilliseconds);
				setYear(t.year.toString());
			};
			const handleNext = () => {
				const t = date.add(Temporal.Duration.from({ years: 1 }));
				setShowTime(t.epochMilliseconds);
				setYear(t.year.toString());
			};
			return (
				<DialogContent className="min-w-full flex">
					<DialogHeader>
						<View className="flex flex-row items-center gap-2 px-1">
							<Button onPress={handlePrev} className="p-0 native:p-0 px-2">
								<ChevronLeft size={35} color="white" />
							</Button>
							<Button className="w-fit" variant="secondary" onPress={() => changeMode("year")}>
								<DialogTitle className="text-3xl">{date.year}</DialogTitle>
							</Button>
							<Button onPress={handleNext} className="p-0 native:p-0 px-2">
								<ChevronRight size={35} color="white" />
							</Button>
						</View>
						<View className="w-32 h-32 bg-black"></View>
					</DialogHeader>
					<View className="gap-1">
						{foldMap(
							Array.from({ length: 12 }).map((_, i) => i),
							4
						).map((is, i) => (
							<View key={i} className="flex-row gap-1">
								{is.map((i) => (
									<Button
										key={i}
										variant={
											timeStartOfDay.month === i + 1 && timeStartOfDay.year === date.year
												? "default"
												: "ghost"
										}
										className="flex-1"
										style={{ height: 70 }}
										onPress={() => handleClick(i + 1)}
									>
										<Text className="native:text-2xl text-2xl">{months[i]}</Text>
									</Button>
								))}
							</View>
						))}
					</View>
					<DialogFooter className="flex items-end justify-center">
						<Button
							variant="outline"
							onPress={() => {
								if (depth === "month") {
									setTime(today.epochMilliseconds);
								} else {
									changeMode("day");
								}
								setShowTime(today.epochMilliseconds);
							}}
						>
							<Text>Bulan Ini</Text>
						</Button>
					</DialogFooter>
				</DialogContent>
			);
		}
	}
	const handleChangeYear = () => {
		const parsed = numeric.safeParse(year);
		if (!parsed.success) {
			return;
		}
		const y = parsed.data;
		if (!Number.isInteger(y)) {
			return;
		}
		let t = Temporal.ZonedDateTime.from({ timeZone: tz, year: y, month: 1, day: 1 });
		if (y < 1900) {
			t = Temporal.ZonedDateTime.from({
				timeZone: tz,
				year: 1900,
				month: 1,
				day: 1,
			});
		} else if (y > 2100) {
			t = Temporal.ZonedDateTime.from({
				timeZone: tz,
				year: 2100,
				month: 1,
				day: 1,
			});
		}
		if (depth === "year") {
			setTime(t.epochMilliseconds);
		} else {
			changeMode("month");
		}
		setShowTime(t.epochMilliseconds);
		setYear(t.year.toString());
	};
	return (
		<DialogContent className="min-w-full">
			<DialogHeader className="flex flex-row">
				<Button variant="secondary" onPress={() => changeMode("day")}>
					<DialogTitle className="text-3xl">Tahun</DialogTitle>
				</Button>
			</DialogHeader>
			<Input
				keyboardType="numeric"
				value={year}
				onChangeText={(v) => setYear(v)}
				onSubmitEditing={handleChangeYear}
			/>

			<DialogFooter className="flex items-end justify-center">
				<Button
					variant="outline"
					onPress={() => {
						if (depth === "year") {
							setTime(today.epochMilliseconds);
						} else {
							setShowTime(today.epochMilliseconds);
							changeMode("month");
						}
						setYear(today.year.toString());
					}}
				>
					<Text>Tahun Ini</Text>
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}
