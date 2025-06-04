import { Show } from "@/components/Show";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { numeric } from "@/lib/utils";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const methodLabel = {
	cash: "Tunai",
	transfer: "Transfer",
	debit: "Debit",
	qris: "QRIS",
};

export function SelectMethod({
	method,
	methods,
	change,
}: {
	method: DB.MethodType | null;
	methods: DB.MethodType[];
	change: (method: DB.MethodType | null) => void;
}) {
	const types = method === null ? [] : methods.filter((m) => m.method === method.method);
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 10,
		right: 10,
	};
	const changeMethod = (option?: { label: string; value: string }) => {
		if (!option) return;
		const method = z.enum(["cash", "transfer", "debit", "qris"]).catch("cash").parse(option.value);
		if (method === "cash") {
			change(null);
			return;
		}
		const type = methods.find((m) => m.method === method);
		if (type === undefined) {
			change(null);
			return;
		}
		change(type);
	};
	const changeType = (option?: { label: string; value: string }) => {
		if (!option) return;
		const parsed = numeric.safeParse(option.value);
		if (!parsed.success) {
			change(null);
			return;
		}
		const type = methods.find((m) => m.id === parsed.data);
		if (type === undefined) {
			change(null);
			return;
		}
		change(type);
	};
	return (
		<View className="items-center gap-2 flex-row">
			<Select
				value={{ value: method?.method ?? "cash", label: methodLabel[method?.method ?? "cash"] }}
				onValueChange={changeMethod}
			>
				<SelectTrigger>
					<SelectValue className="text-foreground text-sm native:text-lg" placeholder="" />
				</SelectTrigger>
				<SelectContent className="z-20 bg-white" insets={contentInsets}>
					<SelectGroup>
						<SelectItem label="Tunai" value="cash">
							Tunai
						</SelectItem>
						<Show when={methods.find((m) => m.method === "transfer") !== undefined}>
							<SelectItem label="Transfer" value="transfer">
								Transfer
							</SelectItem>
						</Show>
						<Show when={methods.find((m) => m.method === "debit") !== undefined}>
							<SelectItem label="Debit" value="debit">
								Debit
							</SelectItem>
						</Show>
						<Show when={methods.find((m) => m.method === "qris") !== undefined}>
							<SelectItem label="QRIS" value="qris">
								QRIS
							</SelectItem>
						</Show>
					</SelectGroup>
				</SelectContent>
			</Select>
			{method !== null && types.length > 0 ? (
				<Select
					value={{ value: method.id.toString(), label: method.name }}
					onValueChange={changeType}
				>
					<SelectTrigger>
						<SelectValue className="text-foreground text-sm native:text-lg" placeholder="" />
					</SelectTrigger>
					<SelectContent className="z-20 bg-white" insets={contentInsets}>
						<SelectGroup>
							{types.map((t) => (
								<SelectItem key={t.id} label={t.name} value={t.id.toString()}>
									{t.name}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			) : null}
		</View>
	);
}
