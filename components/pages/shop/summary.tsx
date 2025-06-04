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
import { View } from "react-native";
import { calcEffectiveAdds, calcTotalBeforeAdds, useItems } from "./use-item";
import { Input } from "@/components/ui/input";
import { SelectKind } from "./select-kind";
import { Field } from "./field";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SelectMethod } from "./select-method";

type Inputs = {
	discVal: string;
	discKind: "percent" | "number";
	fix: string;
	round: string;
	pay: string;
	method: DB.MethodType | null;
};

const emptyFields = {
	discVal: "",
	discKind: "",
	fix: "",
	round: "",
	pay: "",
	method: "",
};

export function SummaryBtn({ methods }: { methods: DB.MethodType[] }) {
	const { items, additionals, fix, disc, set } = useItems();
	const { control, handleSubmit, watch } = useForm<Inputs>({
		defaultValues: { ...emptyFields, method: null, fix: fix.toString(), discKind: "percent" },
	});
	const onSubmit: SubmitHandler<Inputs> = async (raw) => {
		
	}
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
					</View>
					<View className="flex-row gap-2">
						<Field
							label="Potongan"
							name="discVal"
							control={control}
							className="flex-1"
							// error={{ show: error.barcode !== "", msg: error.barcode }}
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
						// error={{ show: error.barcode !== "", msg: error.barcode }}
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
						// error={{ show: error.barcode !== "", msg: error.barcode }}
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
				</DialogHeader>
				<DialogFooter className="flex flex-row justify-end">
					<Button disabled={change < 0} className="flex flex-row gap-2">
						<Text>Bayar</Text>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
