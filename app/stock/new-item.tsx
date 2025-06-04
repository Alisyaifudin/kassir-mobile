import { Show } from "@/components/Show";
import { TextError } from "@/components/TextError";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/useAction";
import { useDB } from "@/hooks/useDB";
import { integer, numeric } from "@/lib/utils";
import { useRouter } from "expo-router";
import React from "react";
import {
	Control,
	Controller,
	ControllerRenderProps,
	SubmitHandler,
	useForm,
} from "react-hook-form";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

type Inputs = {
	name: string;
	price: string;
	capital: string;
	stock: string;
	barcode: string;
	note: string;
};

const schema = z.object({
	name: z.string().min(1, "Harus ada").trim(),
	price: numeric,
	capital: z
		.string()
		.refine((val) => !isNaN(Number(val)), {
			message: "Harus angka",
		})
		.transform((val) => Number(val)),
	stock: integer,
	barcode: z
		.string()
		.trim()
		.transform((v) => (v === "" ? null : v)),
	note: z.string(),
});

type Data = z.infer<typeof schema>;

type FieldNames = keyof Inputs;

const emptyFields = {
	name: "",
	price: "",
	capital: "",
	stock: "",
	barcode: "",
	note: "",
};

export default function Page() {
	const router = useRouter();
	const { control, handleSubmit } = useForm<Inputs>({
		defaultValues: emptyFields,
	});
	const db = useDB();
	const { action, loading, error, setError } = useAction(
		{ ...emptyFields, global: "" },
		async (data: Data) => db.product.insert(data)
	);
	const onSubmit: SubmitHandler<Inputs> = async (raw) => {
		const parsed = schema.safeParse(raw);
		if (!parsed.success) {
			const errs = parsed.error.flatten().fieldErrors;
			setError({
				name: errs.name?.join("; ") ?? "",
				price: errs.price?.join("; ") ?? "",
				capital: errs.capital?.join("; ") ?? "",
				stock: errs.stock?.join("; ") ?? "",
				barcode: errs.barcode?.join("; ") ?? "",
				note: errs.note?.join("; ") ?? "",
				global: "",
			});
			return;
		}
		const errMsg = await action(parsed.data);
		if (errMsg) {
			setError({ ...emptyFields, global: errMsg });
		} else {
			setError(null);
			router.back();
		}
	};
	return (
		<SafeAreaView style={styles.root}>
			<TopNav>Barang Baru</TopNav>
			<View style={styles.container}>
				<Field
					label="Nama*"
					name="name"
					control={control}
					error={{ show: error !== null && error.name !== "", msg: error?.name ?? "" }}
				>
					{({ onBlur, onChange, value }) => (
						<Input onBlur={onBlur} onChangeText={onChange} value={value} />
					)}
				</Field>
				<Field
					label="Harga*"
					name="price"
					control={control}
					error={{ show: error !== null && error.price !== "", msg: error?.price ?? "" }}
				>
					{({ onBlur, onChange, value }) => (
						<Input onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="numeric" />
					)}
				</Field>
				<Field
					label="Modal"
					name="capital"
					control={control}
					error={{ show: error !== null && error?.capital !== "", msg: error?.capital ?? "" }}
				>
					{({ onBlur, onChange, value }) => (
						<Input onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="numeric" />
					)}
				</Field>
				<Field
					label="Stok*"
					name="stock"
					control={control}
					error={{ show: error !== null && error.stock !== "", msg: error?.stock ?? "" }}
				>
					{({ onBlur, onChange, value }) => (
						<Input
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							keyboardType="numeric"
							style={styles.stock}
						/>
					)}
				</Field>
				<Field
					label="Barcode"
					name="barcode"
					control={control}
					error={{ show: error !== null && error.barcode !== "", msg: error?.barcode ?? "" }}
				>
					{({ onBlur, onChange, value }) => (
						<Input onBlur={onBlur} onChangeText={onChange} value={value} />
					)}
				</Field>
				<Field
					label="Catatan"
					name="note"
					control={control}
					error={{ show: error !== null && error.note !== "", msg: error?.note ?? "" }}
				>
					{({ onBlur, onChange, value }) => (
						<Textarea
							textAlignVertical="top"
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
						/>
					)}
				</Field>
				<View style={styles["button-container"]}>
					<Button onPress={handleSubmit(onSubmit)} style={styles.button}>
						<Show when={loading}>
							<ActivityIndicator color="white" />
						</Show>
						<Text style={{ color: "white" }}>Simpan</Text>
					</Button>
				</View>
				<Show when={error !== null && error.global !== ""}>
					<TextError>{error?.global}</TextError>
				</Show>
			</View>
		</SafeAreaView>
	);
}

function Field({
	control,
	error,
	label,
	name,
	children,
}: {
	label: string;
	name: FieldNames;
	control: Control<Inputs, any, Inputs>;
	error?: {
		msg: string;
		show: boolean;
	};
	children: (field: ControllerRenderProps<Inputs, keyof Inputs>) => React.ReactElement;
}) {
	return (
		<View style={styles.field}>
			<View style={styles.label}>
				<Label>{label}</Label>
			</View>
			<View style={styles.value}>
				<Controller control={control} render={({ field }) => children(field)} name={name} />
				<TextError when={error !== undefined && error.show}>{error?.msg}</TextError>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	container: {
		display: "flex",
		gap: 10,
		flexDirection: "column",
		padding: 10,
	},
	field: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
	},
	label: {
		width: 60,
	},
	value: {
		flex: 1,
	},
	stock: {
		width: 50,
		borderWidth: 1,
	},
	"button-container": {
		display: "flex",
		flexDirection: "row",
		justifyContent: "flex-end",
	},
	button: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
});
