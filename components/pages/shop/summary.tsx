import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { ActivityIndicator, View } from "react-native";
import { calcEffectiveAdds, calcTotalBeforeAdds, useItems } from "./use-item";
import { Input } from "@/components/ui/input";
import { SelectKind } from "./select-kind";
import { Field } from "./field";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SelectMethod } from "./select-method";
import { useAction } from "@/hooks/useAction";
import { submit } from "./submit";
import { useDB } from "@/hooks/useDB";
import { z } from "zod";
import { useRouter } from "expo-router";
import { TextError } from "@/components/TextError";
import { Show } from "@/components/Show";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/components/Auth";

const numeric = z
	.string()
	.refine((val) => !isNaN(Number(val)), { message: "Harus angka" })
	.transform((val) => Number(val));

type Inputs = {
	discVal: string;
	discKind: "percent" | "number";
	round: string;
	pay: string;
	method: DB.MethodType | null;
	note: string;
};

const emptyFields = {
	discVal: "",
	discKind: "",
	round: "",
	pay: "",
	method: "",
	note: "",
};

export function SummaryBtn({ methods }: { methods: DB.MethodType[] }) {
	const { items, additionals, fix, disc, set, mode, reset } = useItems();
	const { control, handleSubmit, watch } = useForm<Inputs>({
		defaultValues: { ...emptyFields, method: null, discKind: "percent" },
	});
	const { session } = useSession();
	const router = useRouter();
	const db = useDB();
	const { error, loading, setError, action } = useAction(
		{ global: "", round: "", method: "", pay: "", discVal: "" },
		(record: {
			fix: number;
			round: number;
			method: number | null;
			pay: number;
			discVal: number;
			credit: 0 | 1;
			discKind: DiscKind;
			note: string;
			cashier: string;
		}) => submit(db, mode, items, additionals, record)
	);
	const onSubmit =
		(credit: 0 | 1): SubmitHandler<Inputs> =>
		async (raw) => {
			if (loading) return;
			const parsed = z
				.object({
					round: numeric,
					method: z.number().int().nullable(),
					pay: numeric,
					discVal: numeric,
				})
				.safeParse({
					round: raw.round,
					method: raw.method?.id ?? null,
					pay: raw.pay,
					discVal: raw.discVal,
				});

			if (!parsed.success) {
				const errs = parsed.error.flatten().fieldErrors;
				console.log(errs);
				setError({
					global: "",
					round: errs.round?.join(";") ?? "",
					discVal: errs.discVal?.join(";") ?? "",
					method: errs.method?.join(";") ?? "",
					pay: errs.pay?.join(";") ?? "",
				});
				return;
			}
			const { pay, discVal, method, round } = parsed.data;
			const { discKind, note } = raw;
			const record = {
				fix,
				round,
				method,
				pay,
				discVal,
				discKind,
				credit,
				note,
				cashier: session.name,
			};

			const [errMsg, timestamp] = await action(record);
			if (errMsg) {
				setError({ ...emptyFields, global: errMsg });
			} else {
				reset();
				router.back();
			}
		};
	const { totalBeforeAdds } = calcTotalBeforeAdds(items, disc, fix);
	const { totalAfterAdds } = calcEffectiveAdds(totalBeforeAdds, fix, additionals);
	const round = isNaN(Number(watch("round"))) ? 0 : Number(watch("round"));
	const total = totalAfterAdds.add(round);
	const pay = isNaN(Number(watch("pay"))) ? 0 : Number(watch("pay"));
	const change = total.times(-1).add(pay).toNumber();
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="native:py-0">
					<Text className="native:text-xl">Bayar</Text>
				</Button>
			</DialogTrigger>
			<DialogContent overlayClass="justify-start" className="max-w-full w-full min-w-full  mt-7">
				<DialogHeader>
					<DialogTitle>Rangkuman</DialogTitle>
					<View className="items-center gap-2 border py-0.5 rounded-md border-border">
						<Text className="font-bold text-xl">TOTAL</Text>
						<Text className="text-5xl">Rp{total.toNumber().toLocaleString("id-ID")}</Text>
						<TextError when={error !== null && error.global !== ""}>
							{error?.global ?? ""}
						</TextError>
					</View>
					<View className="flex-row gap-2">
						<Field
							label="Potongan"
							name="discVal"
							control={control}
							className="flex-1"
							error={{ show: error !== null && error.discVal !== "", msg: error?.discVal ?? "" }}
						>
							{({ onBlur, onChange, value }) => (
								<Input
									keyboardType="numeric"
									onBlur={onBlur}
									onChangeText={(v) => {
										const num = Number(v);
										if (isNaN(num) || num < 0) {
											return;
										}
										let val = v;
										if (watch("discKind") === "percent" && num > 100) {
											val = "100";
										}
										set.disc.value(val);
										onChange(val);
									}}
									value={value as string}
								/>
							)}
						</Field>
						<View className="">
							<Label>Jenis</Label>
							<Controller
								name="discKind"
								control={control}
								render={({ field }) => (
									<SelectKind
										kind={field.value}
										change={(v) => {
											set.disc.kind(v);
											field.onChange(v);
										}}
									/>
								)}
							/>
						</View>
					</View>
					<Field
						label="Pembulatan"
						name="round"
						control={control}
						error={{ show: error !== null && error.round !== "", msg: error?.round ?? "" }}
					>
						{({ onBlur, onChange, value }) => (
							<Input
								keyboardType="numeric"
								onBlur={onBlur}
								onChangeText={onChange}
								value={value as string}
							/>
						)}
					</Field>
					<Field
						label="Bayaran"
						name="pay"
						control={control}
						error={{ show: error !== null && error.pay !== "", msg: error?.pay ?? "" }}
					>
						{({ onBlur, onChange, value }) => (
							<Input
								keyboardType="numeric"
								onBlur={onBlur}
								onChangeText={onChange}
								value={value as string}
							/>
						)}
					</Field>
					<View className="flex-row items-center gap-2">
						<Label>Metode</Label>
						<Controller
							name="method"
							control={control}
							render={({ field }) => (
								<SelectMethod
									methods={methods}
									method={field.value as DB.MethodType}
									change={(type) => {
										set.method(type);
										field.onChange(type);
									}}
								/>
							)}
						/>
					</View>
					<View className="items-center gap-2 border py-0.5 rounded-md border-border">
						<Text className="font-bold text-lg">KEMBALIAN</Text>
						<Text className={cn("text-4xl", { "text-red-500": change < 0 })}>
							Rp{change.toLocaleString("id-ID")}
						</Text>
					</View>
					<Field label="Catatan" name="note" control={control}>
						{({ onBlur, onChange, value }) => (
							<Textarea onBlur={onBlur} onChangeText={onChange} value={value as string} />
						)}
					</Field>
				</DialogHeader>
				<DialogFooter className="flex flex-row justify-end">
					<Button
						onPress={handleSubmit(onSubmit(0))}
						disabled={change < 0 && loading}
						className="flex flex-row gap-2 items-center"
					>
						<Show when={loading}>
							<ActivityIndicator color="white" />
						</Show>
						<Text>Bayar</Text>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
