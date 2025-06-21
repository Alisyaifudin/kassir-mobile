import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { integer, numeric } from "@/lib/utils";
import { Menu } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { z } from "zod";
import { AdditionalForm } from "./additional";
import { SubmitHandler, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useItems } from "./use-item";
import { Field } from "./field";
import { BarcodeScanner } from "@/components/BarcodeScanner";

const tabSchema = z.enum(["manual", "additional"]);

type TabOption = z.infer<typeof tabSchema>;

export function ManualBtn() {
	const [tab, setTab] = useState<TabOption>("manual");
	const { set } = useItems();
	const [open, setOpen] = useState(false);
	const handleChangeTab = (v: string) => {
		const tab = tabSchema.catch("manual").parse(v);
		setTab(tab);
	};
	return (
		<Dialog open={open} onOpenChange={(open) => setOpen(open)}>
			<DialogTrigger asChild>
				<Button size="icon" variant="outline">
					<Menu />
				</Button>
			</DialogTrigger>
			<DialogContent
				overlayClass="justify-start"
				className="max-w-full w-full min-w-full h-full max-h-[520] mt-7"
			>
				<DialogHeader>
					<DialogTitle>Tambahkan</DialogTitle>
				</DialogHeader>
				<Tabs
					value={tab}
					onValueChange={handleChangeTab}
					className="w-full mx-auto flex-col gap-1.5 flex-1"
				>
					<TabsList className="flex-row w-full">
						<TabsTrigger value="manual" className="flex-1">
							<Text>Manual</Text>
						</TabsTrigger>
						<TabsTrigger value="additional" className="flex-1">
							<Text>Biaya Lainnya</Text>
						</TabsTrigger>
					</TabsList>
					<TabsContent value="manual" className="flex-1">
						<ManualForm close={() => setOpen(false)} addManual={set.items.addManual} />
					</TabsContent>
					<TabsContent value="additional" className="flex-1">
						<AdditionalForm close={() => setOpen(false)} addAdditional={set.additionals.add} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}

const manualSchema = z.object({
	name: z.string().min(1, "Harus ada").trim(),
	price: numeric,
	qty: integer,
	stock: integer,
	barcode: z
		.string()
		.trim()
		.transform((v) => (v === "" ? null : v)),
});

type Inputs = {
	name: string;
	price: string;
	stock: string;
	qty: string;
	barcode: string;
};

const emptyFields = {
	name: "",
	price: "",
	qty: "",
	stock: "",
	barcode: "",
};

function ManualForm({
	close,
	addManual,
}: {
	close: () => void;
	addManual: (added: {
		qty: number;
		stock: number;
		price: number;
		name: string;
		barcode: string | null;
	}) => "Barang dengan barcode tersebut sudah ada" | null;
}) {
	const { control, handleSubmit } = useForm<Inputs>({
		defaultValues: emptyFields,
	});
	const [error, setError] = useState(emptyFields);
	const onSubmit: SubmitHandler<Inputs> = async (raw) => {
		const parsed = manualSchema.safeParse(raw);
		if (!parsed.success) {
			const errs = parsed.error.flatten().fieldErrors;
			setError({
				name: errs.name?.join("; ") ?? "",
				price: errs.price?.join("; ") ?? "",
				qty: errs.qty !== undefined && errs.qty.length > 0 ? errs.qty[0] : "",
				stock: errs.stock !== undefined && errs.stock.length > 0 ? errs.stock[0] : "",
				barcode: errs.barcode?.join("; ") ?? "",
			});
			return;
		}
		const data = parsed.data;
		if (data.qty > data.stock) {
			setError({ ...emptyFields, qty: "Melebihi stok!" });
			return;
		}
		const errMsg = addManual(parsed.data);
		if (errMsg === null) {
			close();
		} else {
			setError({ ...emptyFields, barcode: errMsg });
		}
	};
	return (
		<View className="flex-col flex flex-1 gap-2">
			<View className="flex flex-col gap-2 flex-1">
				<Field
					label="Barcode"
					name="barcode"
					control={control}
					error={{ show: error.barcode !== "", msg: error.barcode }}
				>
					{({ onBlur, onChange, value }) => (
						<View className="flex-row items-center gap-1">
							<BarcodeScanner onScan={onChange} />
							<Input className="flex-1" onBlur={onBlur} onChangeText={onChange} value={value} />
						</View>
					)}
				</Field>
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
				<Field
					label="Harga*"
					name="price"
					control={control}
					error={{ show: error.price !== "", msg: error.price }}
				>
					{({ onBlur, onChange, value }) => (
						<Input keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value} />
					)}
				</Field>
				<View className="flex-row gap-1 w-full ">
					<Field
						label="Kuantitas*"
						name="qty"
						control={control}
						className="flex-1"
						error={{ show: error.qty !== "", msg: error.qty }}
					>
						{({ onBlur, onChange, value }) => (
							<Input keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value} />
						)}
					</Field>
					<Field
						label="Stok*"
						name="stock"
						className="flex-1"
						control={control}
						error={{ show: error.stock !== "", msg: error.stock }}
					>
						{({ onBlur, onChange, value }) => (
							<Input keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value} />
						)}
					</Field>
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
