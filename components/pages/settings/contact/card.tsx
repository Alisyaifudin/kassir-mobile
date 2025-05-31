import { Button } from "@/components/ui/button";
import { Save } from "lucide-react-native";
import { SubmitHandler, useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import { Field } from "./field";
import { Input } from "@/components/ui/input";
import { useAction } from "@/hooks/useAction";
import { useDB } from "@/hooks/useDB";
import Toast from "react-native-toast-message";
import { Show } from "@/components/Show";
import { DeleteBtn } from "./delete-btn";

type Inputs = {
	value: string;
	name: string;
};

export function Card({ social }: { social: DB.Social }) {
	const { control, handleSubmit } = useForm<Inputs>({
		defaultValues: { value: social.value, name: social.name },
	});
	const db = useDB();
	const { error, loading, setError, action } = useAction(
		{ value: "", name: "" },
		(data: { name: string; value: string }) => db.social.update(social.id, data.name, data.value)
	);
	const onSubmit: SubmitHandler<Inputs> = async (raw) => {
		const { name, value } = raw;
		const errs = { value: "", name: "" };
		if (name.trim() === "") {
			errs.name = "Harus ada";
		}
		if (value.trim() === "") {
			errs.name = "Harus ada";
		}
		if (errs.value !== "" || errs.name !== "") {
			setError(errs);
			return;
		}
		const errMsg = await action({ name, value });
		if (errMsg !== null) {
			setError({ name: "", value: errMsg });
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
					name="value"
					label="Isian"
					classInput="flex-1"
					classLabel="w-[50]"
					className="flex-row items-center gap-1"
					error={{ show: error !== null && error.value !== "", msg: error?.value ?? "" }}
				>
					{({ onBlur, onChange, value }) => (
						<Input value={value} onChangeText={onChange} onBlur={onBlur} />
					)}
				</Field>
			</View>
			<View className="gap-3">
				<Show
					when={loading}
					fallback={
						<Button size="icon" onPress={handleSubmit(onSubmit)}>
							<Save color="white" />
						</Button>
					}
				>
					<ActivityIndicator size={34} />
				</Show>
				<DeleteBtn social={social} />
			</View>
		</View>
	);
}
