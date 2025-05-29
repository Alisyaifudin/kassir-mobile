import React from "react";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { TopNav } from "@/components/TopNav";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useDB } from "@/hooks/useDB";
import { useAction } from "@/hooks/useAction";
import { useSession } from "@/components/Auth";
import { emitter } from "@/lib/event-emitter";
import { ActivityIndicator, View } from "react-native";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TextError } from "@/components/TextError";
import { Button } from "@/components/ui/button";
import { Show } from "@/components/Show";

type Inputs = {
	name: string;
};

export default function Page() {
	const session = useSession();
	const { control, handleSubmit } = useForm<Inputs>({
		defaultValues: { name: session.name },
	});
	const db = useDB();
	const { error, loading, setError, action } = useAction("", (name: string) => {
		return db.cashier.updateName(session.id, name);
	});
	const onSubmit: SubmitHandler<Inputs> = async (raw) => {
		const { name } = raw;
		if (name.trim() === "") {
			setError("Harus ada");
			return;
		}
		const errMsg = await action(name.trim());
		setError(errMsg);
		if (errMsg === null) {
			emitter.emit("fetch-session");
		}
	};
	return (
		<SafeAreaView className="flex-1 justify-between">
			<View>
				<TopNav>Profil</TopNav>
				<View className="flex-row gap-2 items-center">
					<Label>Nama</Label>
					<Controller
						control={control}
						render={({ field }) => (
							<Input value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} />
						)}
						name="name"
					/>
				</View>
				<TextError when={error !== null}>{error}</TextError>
			</View>
			<View className="items-end">
				<Button className="flex-row gap-2 items-center">
					<Show when={loading}>
						<ActivityIndicator color="white" />
					</Show>
					<Text>Simpan</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
