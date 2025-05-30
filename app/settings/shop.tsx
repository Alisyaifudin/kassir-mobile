import React from "react";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "@/components/TopNav";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAction } from "@/hooks/useAction";
import { ActivityIndicator, View } from "react-native";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Show } from "@/components/Show";
import { TextError } from "@/components/TextError";
import Toast from "react-native-toast-message";
import { Field } from "@/components/pages/shop/field";
import { store, StoreInfo } from "@/lib/store";
import { useAsync } from "@/hooks/useAsync";
import { Await } from "@/components/Await";
import { Textarea } from "@/components/ui/textarea";

type Inputs = StoreInfo;

export default function Page() {
	const state = useAsync(() => store.get());
	return (
		<SafeAreaView className="flex-1 gap-2">
			<TopNav>Toko</TopNav>
			<Await state={state}>{(info) => <Form info={info} />}</Await>
		</SafeAreaView>
	);
}

function Form({ info }: { info: StoreInfo }) {
	const { control, handleSubmit } = useForm<Inputs>({
		defaultValues: info,
	});
	const { error, loading, setError, action } = useAction("", (info: StoreInfo) => store.set(info));
	const onSubmit: SubmitHandler<Inputs> = async (info) => {
		const errMsg = await action(info);
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
					<Input value={value} onChangeText={onChange} onBlur={onBlur} />
				)}
			</Field>
			<Field control={control} label="Alamat" name="address">
				{({ onBlur, onChange, value }) => (
					<Input value={value} onChangeText={onChange} onBlur={onBlur} />
				)}
			</Field>
			<Field control={control} label="Deskripsi atas" name="header">
				{({ onBlur, onChange, value }) => (
					<Textarea value={value} onChangeText={onChange} onBlur={onBlur} />
				)}
			</Field>
			<Field control={control} label="Deskripsi bawah" name="footer">
				{({ onBlur, onChange, value }) => (
					<Textarea value={value} onChangeText={onChange} onBlur={onBlur} />
				)}
			</Field>
			<TextError when={error !== null && error !== ""}>{error}</TextError>
			<Button onPress={handleSubmit(onSubmit)} className="flex-row gap-2 items-center">
				<Show when={loading}>
					<ActivityIndicator color="white" />
				</Show>
				<Text>Simpan</Text>
			</Button>
		</View>
	);
}
