import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const methodLabel = {
	abs: "Mutlak",
	change: "Perubahan",
} as const;

export function SelectMethod({
	method,
	onChange,
}: {
	method: "abs" | "change";
	onChange: (method: "abs" | "change") => void;
}) {
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};
	const handleChange = (option?: { label: string; value: string }) => {
		if (!option) return;
		if (option.value === "abs" || option.value === "change") {
			onChange(option.value);
		}
	};
	return (
		<View className="flex-row gap-1 items-center">
			<Select value={{ value: method, label: methodLabel[method] }} onValueChange={handleChange}>
				<SelectTrigger>
					<SelectValue
						className="text-foreground text-sm native:text-lg"
						placeholder="Select a fruit"
					/>
				</SelectTrigger>
				<SelectContent className="z-20 bg-white" insets={contentInsets}>
					<SelectGroup>
						<SelectItem label="Perubahan" value="change">
							Perubahan
						</SelectItem>
						<SelectItem label="Mutlak" value="abs">
							Mutlak
						</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
		</View>
	);
}
