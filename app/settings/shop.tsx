import React from "react";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "@/components/TopNav";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useAction } from "@/hooks/useAction";
import { ActivityIndicator, View } from "react-native";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Show } from "@/components/Show";
import { TextError } from "@/components/TextError";
import Toast from "react-native-toast-message";
import { Field } from "@/components/pages/shop/field";
import { store, Profile } from "@/lib/store";
import { useAsync } from "@/hooks/useAsync";
import { Await } from "@/components/Await";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type Inputs = Omit<Profile, "showCashier"> & { showCashier: boolean };

export default function Page() {
	const state = useAsync(() => store.get());
	return (
		<SafeAreaView className="flex-1 gap-2">
			<TopNav>Toko</TopNav>
			<Await state={state}>{(info) => <Form info={info} />}</Await>
		</SafeAreaView>
	);
}

function Form({ info }: { info: Profile }) {
	const { control, handleSubmit } = useForm<Inputs>({
		defaultValues: { ...info, showCashier: info.showCashier === "true" },
	});
	const { error, loading, setError, action } = useAction("", (info: Profile) => store.set(info));
	const onSubmit: SubmitHandler<Inputs> = async (info) => {
		const errMsg = await action({ ...info, showCashier: String(info.showCashier) });
		setError(errMsg);
		if (errMsg === null) {
			Toast.show({
				type: "success",
				text1: "Berhasil disimpan",
			});
		}
	};
	return (
		<View className="gap-2 p-2">
			<Field control={control} label="Nama Toko" name="name">
				{({ onBlur, onChange, value }) => (
					<Input value={value as string} onChangeText={onChange} onBlur={onBlur} />
				)}
			</Field>
			<Field control={control} label="Alamat" name="address">
				{({ onBlur, onChange, value }) => (
					<Input value={value as string} onChangeText={onChange} onBlur={onBlur} />
				)}
			</Field>
			<Field control={control} label="Deskripsi atas" name="header">
				{({ onBlur, onChange, value }) => (
					<Textarea value={value as string} onChangeText={onChange} onBlur={onBlur} />
				)}
			</Field>
			<Field control={control} label="Deskripsi bawah" name="footer">
				{({ onBlur, onChange, value }) => (
					<Textarea value={value as string} onChangeText={onChange} onBlur={onBlur} />
				)}
			</Field>
			<TextError when={error !== null && error !== ""}>{error}</TextError>
			<Controller
				name="showCashier"
				control={control}
				render={({field}) => (
					<View className="flex-row items-center gap-2">
						<Label>Tampilkan nama kasir</Label>
						 <Checkbox checked={field.value} onCheckedChange={field.onChange} />
					</View>
				)}
			/>
			<Button onPress={handleSubmit(onSubmit)} className="flex-row gap-2 items-center">
				<Show when={loading}>
					<ActivityIndicator color="white" />
				</Show>
				<Text>Simpan</Text>
			</Button>
		</View>
	);
}
