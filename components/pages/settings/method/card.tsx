import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react-native";
import { SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import { Field } from "./field";
import { Input } from "@/components/ui/input";
import { useAction } from "@/hooks/useAction";
import { useDB } from "@/hooks/useDB";
import Toast from "react-native-toast-message";

type Inputs = {
	label: string;
	name: string;
};

export function Card({ method }: { method: DB.MethodType }) {
	const { control, handleSubmit } = useForm<Inputs>({
		defaultValues: { label: method.label, name: method.name },
	});
	const db = useDB();
	const { error, loading, setError, action } = useAction(
		{ label: "", name: "" },
		(data: { name: string; label: string }) => db.method.update(method.id, data.name, data.label)
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
		if (errMsg !== null) {
			setError({ name: "", label: errMsg });
		} else {
			setError(null);
			Toast.show({
				type: "success",
				text1: "Berhasil disimpan",
			});
		}
	};
	return (
		<View className="flex-row gap-2 w-full p-2 bg-white items-center">
			<View className="flex-1 gap-1">
				<Field
					control={control}
					name="name"
					label="Nama"
					classInput="flex-1"
					classLabel="w-[50]"
					className="flex-row items-center gap-1"
					error={{ show: error !== null && error.name !== "", msg: error?.name ?? "" }}
				>
					{({ onBlur, onChange, value }) => (
						<Input value={value} onChangeText={onChange} onBlur={onBlur} />
					)}
				</Field>
				<Field
					control={control}
					name="label"
					label="Label"
					classInput="flex-1"
					classLabel="w-[50]"
					className="flex-row items-center gap-1"
					error={{ show: error !== null && error.label !== "", msg: error?.label ?? "" }}
				>
					{({ onBlur, onChange, value }) => (
						<Input value={value} onChangeText={onChange} onBlur={onBlur} />
					)}
				</Field>
			</View>
			<View className="gap-3">
				<Button size="icon" onPress={handleSubmit(onSubmit)}>
					<Save color="white" />
				</Button>
				<Button size="icon" variant="destructive">
					<X color="white" />
				</Button>
			</View>
		</View>
	);
}
