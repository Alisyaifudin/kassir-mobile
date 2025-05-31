import { ActivityIndicator, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Show } from "@/components/Show";
import { useAction } from "@/hooks/useAction";
import { constructCSV, downloadCSV } from "@/lib/download";
import { useDB } from "@/hooks/useDB";
import { Temporal } from "temporal-polyfill";
import Toast from "react-native-toast-message";
import { TextError } from "@/components/TextError";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/Calendar";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
	start: number;
	end: number;
};

export function Record() {
	const db = useDB();
	const tz = Temporal.Now.timeZoneId();
	const now = Temporal.Now.instant().toZonedDateTimeISO(tz).startOfDay();
	const startOfMonth = Temporal.ZonedDateTime.from({
		timeZone: tz,
		year: now.year,
		month: 1,
		day: 1,
	});
	const endOfMonth = startOfMonth.add(Temporal.Duration.from({ months: 1 }));
	const { control, handleSubmit, watch } = useForm<Inputs>({
		defaultValues: { start: startOfMonth.epochMilliseconds, end: endOfMonth.epochMilliseconds },
	});
	const { loading, error, setError, action } = useAction("", async () => {
		const [errProduct, products] = await db.product.getAll();
		if (errProduct) return errProduct;
		const [errCSV, csvFile] = constructCSV(products);
		if (errCSV) return errCSV;
		const now = Temporal.Now.instant().epochMilliseconds;
		const [errDownload, msg] = await downloadCSV(csvFile, `products-${now}.csv`);
		if (errDownload) return errDownload;
		Toast.show({
			type: "success",
			text1: msg,
		});
		return null;
	});
	const onSubmit: SubmitHandler<Inputs> = async ({ start, end }) => {
		if (end < start) {
			setError("Waktu `Dari` harus lebih awal daripada `Sampai`")
			return;
		}
		// TODO
		// const errMsg = await action();
		// setError(errMsg);
	};
	return (
		<View className="flex gap-2 flex-col p-2 bg-sky-50">
			<View className="gap-2">
				<View className="flex-row justify-between items-center">
					<Text className="italic text-xl">Riwayat</Text>
					<Button onPress={handleSubmit(onSubmit)} className="flex-row gap-2 items-center">
						<Text>Unduh</Text>
						<Show when={loading}>
							<ActivityIndicator color="white" />
						</Show>
					</Button>
				</View>
				<View className="flex flex-row gap-3 items-end">
					<View className="flex flex-col gap-1">
						<Label>Dari:</Label>
						<Controller
							control={control}
							name="start"
							render={({ field }) => <Calendar onChange={field.onChange} time={field.value} />}
						/>
					</View>
					<Text className="h-9">&mdash;</Text>
					<View className="flex flex-col gap-1">
						<Label>Sampai:</Label>
						<Controller
							control={control}
							name="end"
							render={({ field }) => <Calendar onChange={field.onChange} time={field.value} />}
						/>
					</View>
				</View>
			</View>
			<TextError when={error !== null && error !== ""}>{error}</TextError>
		</View>
	);
}
