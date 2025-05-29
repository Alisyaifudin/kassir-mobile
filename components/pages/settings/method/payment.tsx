import { ActivityIndicator, View } from "react-native";
import { Text } from "@/components/ui/text";
import { FAB } from "@/components/Fab";
import { Plus } from "lucide-react-native";
import { useDB } from "@/hooks/useDB";
import { useAction } from "@/hooks/useAction";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Show } from "@/components/Show";
import { Field } from "./field";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState } from "react";
import { useAsync } from "@/hooks/useAsync";
import { Await } from "@/components/Await";
import { emitter } from "@/lib/event-emitter";
import { Card } from "./card";
export function PaymentMethod({ method }: { method: DB.Method }) {
	const state = useMethods();
	return (
		<View className="flex-1">
			<Await state={state}>
				{(methods) => (
					<View className="gap-2 px-2">
						{methods
							.filter((m) => m.method === method)
							.map((method) => (
								<Card key={method.id} method={method} />
							))}
					</View>
				)}
			</Await>

			<FAB>
				<NewBtn method={method} />
			</FAB>
		</View>
	);
}

function useMethods() {
	const db = useDB();
	const state = useAsync(() => db.method.get(), ["fetch-methods"]);
	return state;
}

type Inputs = {
	label: string;
	name: string;
};

export function NewBtn({ method }: { method: DB.Method }) {
	const db = useDB();
	const { handleSubmit, control, reset } = useForm<Inputs>();
	const [open, setOpen] = useState(false);
	const { error, loading, setError, action } = useAction(
		{ label: "", name: "" },
		async (data: { name: string; label: string }) => db.method.insert(data.name, data.label, method)
	);
	const onSubmit: SubmitHandler<Inputs> = async (raw) => {
		const { name, label } = raw;
		const errs = { label: "", name: "" };
		if (name.trim() === "") {
			errs.name = "Harus ada";
		}
		if (label.trim() === "") {
			errs.name = "Harus ada";
		}
		if (errs.label !== "" || errs.name !== "") {
			setError(errs);
			return;
		}
		const errMsg = await action({ name: raw.name, label: raw.label });
		if (errMsg === null) {
			emitter.emit("fetch-methods");
			setOpen(false);
			reset();
		} else {
			setError({ name: "", label: errMsg });
		}
	};
	return (
		<Dialog open={open} onOpenChange={(open) => setOpen(open)}>
			<DialogTrigger asChild>
				<Plus size={24} color="white" />
			</DialogTrigger>
			<DialogContent className="max-w-full w-full min-w-full mb-36">
				<DialogHeader>
					<DialogTitle>Metode Baru</DialogTitle>
					<Field
						control={control}
						name="name"
						label="Nama"
						error={{ show: error !== null && error.name !== "", msg: error?.name ?? "" }}
						desc={
							<View>
								<Text className="text-sm text-muted-foreground">Nama metode pembayaran.</Text>
								<Text className="text-sm text-muted-foreground">
									Contoh: DANA Ali, DANA Adam, dll...
								</Text>
							</View>
						}
					>
						{({ onChange, onBlur, value }) => (
							<Input onChangeText={onChange} value={value} onBlur={onBlur} />
						)}
					</Field>
					<Field
						control={control}
						name="label"
						label="Label"
						error={{ show: error !== null && error.label !== "", msg: error?.label ?? "" }}
						desc={
							<View>
								<Text className="text-sm text-muted-foreground">
									Label metode pembayaran pada struk.
								</Text>
								<Text className="text-sm text-muted-foreground">
									Contoh: DANA, BCA, BRI, dll...
								</Text>
							</View>
						}
					>
						{({ onChange, onBlur, value }) => (
							<Input onChangeText={onChange} value={value} onBlur={onBlur} />
						)}
					</Field>
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
