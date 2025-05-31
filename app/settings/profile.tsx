import React from "react";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "@/components/TopNav";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useDB } from "@/hooks/useDB";
import { useAction } from "@/hooks/useAction";
import { useSession } from "@/components/Auth";
import { ActivityIndicator, View } from "react-native";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TextError } from "@/components/TextError";
import { Button } from "@/components/ui/button";
import { Show } from "@/components/Show";
import { PasswordForm } from "@/components/pages/settings/profile/password";
import Toast from "react-native-toast-message";

type Inputs = {
	name: string;
};

export default function Page() {
	const { session, set } = useSession();
	const { control, handleSubmit, watch } = useForm<Inputs>({
		defaultValues: { name: session.name },
	});
	const db = useDB();
	const { error, loading, setError, action } = useAction("", (name: string) => {
		return db.cashier.update.name(session.id, name);
	});
	const onSubmit: SubmitHandler<Inputs> = async (raw) => {
		const { name } = raw;
		if (name.trim() === "") {
			setError("Harus ada");
			return;
		}
		const errMsg = await action(name.trim());
		setError(errMsg);
		const errSession = await set.name(name);
		setError(errSession);
		if (errSession === null) {
			Toast.show({
				type: "success",
				text1: "Berhasil disimpan",
			});
		}
	};
	return (
		<SafeAreaView className="flex-1 justify-between">
			<View>
				<TopNav>Profil</TopNav>
				<View className="flex-row gap-2 items-center p-2">
					<Label>Nama</Label>
					<Controller
						control={control}
						render={({ field }) => (
							<Input
								className="flex-1"
								value={field.value}
								onChangeText={field.onChange}
								onBlur={field.onBlur}
								onSubmitEditing={handleSubmit(onSubmit)}
							/>
						)}
						name="name"
					/>
				</View>
				<TextError when={error !== null && error !== ""}>{error}</TextError>
				<View className="items-end p-2">
					<Button
						onPress={handleSubmit(onSubmit)}
						disabled={watch("name").trim() === ""}
						className="flex-row gap-2 items-center"
					>
						<Show when={loading}>
							<ActivityIndicator color="white" />
						</Show>
						<Text>Simpan</Text>
					</Button>
				</View>
			</View>
			<PasswordForm />
		</SafeAreaView>
	);
}
