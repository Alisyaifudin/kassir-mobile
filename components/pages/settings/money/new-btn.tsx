import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useAction } from "@/hooks/useAction";
import { useDB } from "@/hooks/useDB";
import { emitter } from "@/lib/event-emitter";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Plus } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Show } from "@/components/Show";
import { SelectMethod } from "./select-method";
import { TextError } from "@/components/TextError";

type Inputs = {
	value: string;
	method: "change" | "abs";
};

export function NewBtn({ kind }: { kind: DB.MoneyKind }) {
	const db = useDB();
	const { handleSubmit, control, reset } = useForm<Inputs>({
		defaultValues: { value: "", method: "change" },
	});
	const [open, setOpen] = useState(false);
	const { error, loading, setError, action } = useAction(
		"",
		async (data: { value: number; method: "change" | "abs" }) =>
			db.money.insert[data.method](data.value, kind)
	);
	const onSubmit: SubmitHandler<Inputs> = async (raw) => {
		const { value, method } = raw;
		if (value.trim() === "") {
			setError("Harus ada");
			return;
		}
		const num = Number(value);
		if (isNaN(num)) {
			setError("Harus angka");
			return;
		}

		const errMsg = await action({ value: num, method });
		setError(errMsg);
		if (errMsg === null) {
			emitter.emit("fetch-money");
			setOpen(false);
			reset();
		}
	};
	return (
		<Dialog open={open} onOpenChange={(open) => setOpen(open)}>
			<DialogTrigger asChild>
				<Plus size={24} color="white" />
			</DialogTrigger>
			<DialogContent className="max-w-full w-full min-w-full mb-36">
				<DialogHeader>
					<DialogTitle>Tambah Catatan Keuangan</DialogTitle>
					<View className="flex-row gap-2 items-end">
						<Controller
							name="value"
							control={control}
							render={({ field }) => (
								<Input
									placeholder="Nilai"
									keyboardType="numeric"
									className="flex-1"
									onChangeText={field.onChange}
									value={field.value}
									onBlur={field.onBlur}
									onSubmitEditing={handleSubmit(onSubmit)}
								/>
							)}
						/>

						<Controller
							name="method"
							control={control}
							render={({ field }) => (
								<SelectMethod method={field.value} onChange={field.onChange} />
							)}
						/>
					</View>
					<TextError when={error !== null && error !== ""}>{error}</TextError>
				</DialogHeader>
				<DialogFooter className="flex flex-row justify-between">
					<DialogClose asChild>
						<Button variant="secondary">
							<Text>Batal</Text>
						</Button>
					</DialogClose>
					<Button onPress={handleSubmit(onSubmit)} className="flex flex-row gap-2">
						<Show when={loading}>
							<ActivityIndicator color="white" />
						</Show>
						<Text>Simpan</Text>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
