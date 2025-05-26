import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const kindLabel = {
	percent: "Persen",
	number: "Angka",
} as const;

export function SelectKind({
	kind,
	change,
}: {
	kind: "percent" | "number";
	change: (kind: string) => void;
}) {
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};
	const changeKind = (option?: { label: string; value: string }) => {
		if (!option) return;
		change(option.value);
	};
	return (
		<Select value={{ value: kind, label: kindLabel[kind] }} onValueChange={changeKind}>
			<SelectTrigger>
				<SelectValue
					className="text-foreground text-sm native:text-lg"
					placeholder="Select a fruit"
				/>
			</SelectTrigger>
			<SelectContent className="z-20 bg-white" insets={contentInsets}>
				<SelectGroup>
					<SelectItem label="Persen" value="percent">
						Persen
					</SelectItem>
					<SelectItem label="Angka" value="number">
						Angka
					</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
