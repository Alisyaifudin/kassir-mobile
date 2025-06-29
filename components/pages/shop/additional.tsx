import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { numeric } from "@/lib/utils";
import { useState } from "react";
import {
	Controller,
	SubmitHandler,
	useForm,
} from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";
import { SelectKind } from "./select-kind";
import { Additional, useItems } from "./use-item";
import { useDebounceCallback } from "@react-hook/debounce";
import { Show } from "@/components/Show";
import { Cond } from "@/components/Cond";
import { X } from "lucide-react-native";
import { Field } from "./field";

const schema = z.object({
	name: z.string().min(1, "Harus ada").trim(),
	value: numeric,
	kind: z.enum(["percent", "number"]),
});

type Inputs = {
	name: string;
	value: string;
	kind: "number" | "percent";
};

const emptyFields = {
	name: "",
	value: "",
	kind: "",
};

export function AdditionalForm({
	close,
	addAdditional,
}: {
	close: () => void;
	addAdditional: (added: z.infer<typeof schema>) => void;
}) {
	const { control, handleSubmit } = useForm<Inputs>({
		defaultValues: { ...emptyFields, kind: "percent" },
	});
	const [error, setError] = useState(emptyFields);
	const onSubmit: SubmitHandler<Inputs> = async (raw) => {
		const parsed = schema.safeParse(raw);
		if (!parsed.success) {
			const errs = parsed.error.flatten().fieldErrors;
			setError({
				name: errs.name?.join("; ") ?? "",
				value: errs.value?.join("; ") ?? "",
				kind: errs.kind?.join("; ") ?? "",
			});
			return;
		}
		const data = parsed.data;
		if (data.kind === "percent" && data.value > 100) {
			setError({ ...emptyFields, value: "Lebih dari seratus" });
			return;
		}
		if (data.value < 0) {
			setError({ ...emptyFields, value: "Kurang dari nol" });
			return;
		}
		addAdditional(parsed.data);
		setError(emptyFields);
		close();
	};
	return (
		<View className="flex-col flex-1 justify-between gap-2">
			<View className="flex flex-col gap-2">
				<Field
					label="Nama*"
					name="name"
					control={control}
					error={{ show: error.name !== "", msg: error.name }}
				>
					{({ onBlur, onChange, value }) => (
						<Input onBlur={onBlur} onChangeText={onChange} value={value} />
					)}
				</Field>
				<View className="flex-row gap-2 items-center">
					<Field
						label="Nilai*"
						name="value"
						className="flex-1"
						control={control}
						error={{ show: error.name !== "", msg: error.name }}
					>
						{({ onBlur, onChange, value }) => (
							<Input keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value} />
						)}
					</Field>
					<View>
						<Label>Jenis</Label>
						<Controller
							name="kind"
							control={control}
							render={({ field }) => <SelectKind kind={field.value} change={field.onChange} />}
						/>
					</View>
				</View>
			</View>
			<View className="flex flex-row justify-end">
				<Button className="flex flex-row gap-2" onPress={handleSubmit(onSubmit)}>
					<Text>Tambahkan</Text>
				</Button>
			</View>
		</View>
	);
}



export function AdditionalCard({
	additional,
	index,
	effVal,
	totalAfterAdds,
}: {
	additional: Additional;
	index: number;
	effVal: number;
	totalAfterAdds: number;
}) {
	const { set, additionals } = useItems();
	const [additionalLocal, setAddsLocal] = useState({
		name: additional.name,
		value: additional.value.toString(),
		kind: additional.kind,
	});

	const debounce = {
		name: useDebounceCallback((val: string) => {
			set.additionals.name(index, val);
		}, 300),
		value: useDebounceCallback((val: string) => {
			set.additionals.value(index, val);
		}, 300),
		kind: useDebounceCallback((val: string) => {
			set.additionals.kind(index, val);
		}, 300),
	};
	const changeName = (v: string) => {
		setAddsLocal({ ...additionalLocal, name: v.trimStart() });
		debounce.name(v);
	};
	const changeValue = (v: string) => {
		let num = Number(v);
		let val = v;
		if (isNaN(num) || num < 0) {
			return;
		}
		if (additionalLocal.kind === "percent" && num > 100) {
			val = "100";
		}
		setAddsLocal({ ...additionalLocal, value: val });
		debounce.value(val);
	};

	const changeKind = (v: string) => {
		const kind = z.enum(["percent", "number"]).catch("percent").parse(v);
		let value = additional.value;
		if (kind === "percent" && Number(additionalLocal.value) > 100) {
			value = 100;
		}
		setAddsLocal({ ...additionalLocal, value: value.toString(), kind });
		debounce.kind(kind);
	};

	const handleRemove = () => {
		set.additionals.remove(index);
	};

	return (
		<>
			<Show when={index === 0}>
				<View className="mt-5">
					<Text className="font-bold">Biaya tambahan</Text>
				</View>
			</Show>
			<View className="flex gap-1 bg-zinc-50 p-0.5 mt-1 shadow-black shadow-md">
				<View className="flex-row items-center gap-2">
					<Input value={additionalLocal.name} className="flex-1" onChangeText={changeName} />
					<View className="w-[100] items-end">
						<Cond
							when={additional.kind === "percent"}
							fallback={
								<Input
									value={additionalLocal.value}
									className="w-full flex-1"
									onChangeText={changeValue}
								/>
							}
						>
							<Text className="text-xl">{effVal.toLocaleString("id-ID")}</Text>
						</Cond>
					</View>
					<Button onPress={handleRemove} size="icon" variant="destructive">
						<X color="white" />
					</Button>
				</View>
				<View className="flex-row gap-2 items-center">
					<SelectKind kind={additionalLocal.kind} change={changeKind} />
					<Show when={additional.kind === "percent"}>
						<View className="flex-row items-center">
							<Input
								keyboardType="numeric"
								value={additionalLocal.value}
								className="w-[80]"
								onChangeText={changeValue}
							/>
							<Text className="text-xl"> %</Text>
						</View>
					</Show>
				</View>
			</View>
			<Show when={index === additionals.length - 1}>
				<View className="mt-5 items-end">
					<Text className="font-bold text-xl">
						Total: Rp{totalAfterAdds.toLocaleString("id-ID")}
					</Text>
				</View>
			</Show>
		</>
	);
}
