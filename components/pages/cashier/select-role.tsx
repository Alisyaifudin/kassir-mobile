import { Show } from "@/components/Show";
import { TextError } from "@/components/TextError";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAction } from "@/hooks/useAction";
import { useDB } from "@/hooks/useDB";
import { emitter } from "@/lib/event-emitter";
import { ActivityIndicator, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export const roleLabel = {
	manager: "Manajer",
	user: "Biasa",
	admin: "Admin",
} as const;

export function SelectRole({ role, id }: { role: Role; id: number }) {
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};
	const db = useDB();
	const { loading, error, setError, action } = useAction("", (role: "manager" | "user") =>
		db.cashier.update.role(id, role)
	);
	const changeRole = async (option?: { label: string; value: string }) => {
		if (!option) return;
		if (option.value === "manager" || option.value === "user") {
			const errMsg = await action(option.value);
			setError(errMsg);
			if (errMsg === null) {
				emitter.emit("fetch-cashiers");
				Toast.show({
					type: "success",
					text1: "Berhasil disimpan",
				});
			}
		}
	};
	return (
		<View className="flex-row gap-1 items-center">
			<Select value={{ value: role, label: roleLabel[role] }} onValueChange={changeRole}>
				<SelectTrigger>
					<SelectValue
						className="text-foreground text-sm native:text-lg"
						placeholder="Select a fruit"
					/>
				</SelectTrigger>
				<SelectContent className="z-20 bg-white" insets={contentInsets}>
					<SelectGroup>
						<SelectItem label="Manajer" value="manager">
							Manajer
						</SelectItem>
						<SelectItem label="Pengguna" value="user">
							Pengguna
						</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
			<Show when={loading}>
				<ActivityIndicator />
			</Show>
			<TextError when={error !== null && error !== ""}>{error}</TextError>
		</View>
	);
}
