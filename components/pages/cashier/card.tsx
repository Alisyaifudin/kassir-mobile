import { Button } from "@/components/ui/button";
import { Save } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import { Input } from "@/components/ui/input";
import { useAction } from "@/hooks/useAction";
import { useDB } from "@/hooks/useDB";
import Toast from "react-native-toast-message";
import { Show } from "@/components/Show";
import { DeleteBtn } from "./delete-btn";
import { useState } from "react";
import { TextError } from "@/components/TextError";
import { roleLabel, SelectRole } from "./select-role";
import { Text } from "@/components/ui/text";
import { useSession } from "@/components/Auth";

export function Card({ cashier }: { cashier: DB.Cashier }) {
	const [name, setName] = useState(cashier.name);
	const db = useDB();
	const { error, loading, setError, action } = useAction("", () =>
		db.cashier.update.name(cashier.id, name)
	);
	const handleSubmit = async () => {
		if (name.trim() === "") {
			setError("Tidak boleh kosong");
			return;
		}
		const errMsg = await action();
		setError(errMsg);
		if (errMsg === null) {
			Toast.show({
				type: "success",
				text1: "Berhasil disimpan",
			});
		}
	};
	const { session } = useSession();
	if (session.id === cashier.id) {
		return (
			<View className="flex gap-2 w-full p-2 bg-white">
				<Text className="text-xl">{cashier.name}</Text>
				<Text>Peran: {roleLabel[cashier.role]}</Text>
			</View>
		);
	}
	return (
		<View className="flex gap-2 w-full p-2 bg-white">
			<View className="gap-1 flex-row justify-between">
				<Input value={name} className="flex-1" onChangeText={setName} />
				<Show
					when={loading}
					fallback={
						<Button size="icon" onPress={handleSubmit}>
							<Save color="white" />
						</Button>
					}
				>
					<ActivityIndicator size={34} />
				</Show>
			</View>
			<TextError when={error !== null && error !== ""}>{error}</TextError>
			<Show when={cashier.role !== "admin"} fallback={<Text>Admin</Text>}>
				<View className="gap-1 justify-between items-center flex-row">
					<View className="flex-row gap-1 items-center">
						<Text>Peran:</Text>
						<SelectRole role={cashier.role} id={cashier.id} />
					</View>
					<DeleteBtn cashier={cashier} />
				</View>
			</Show>
		</View>
	);
}
