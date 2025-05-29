import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function SelectFix({ fix, change }: { fix: string; change: (fix: string) => void }) {
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 10,
		right: 10,
	};
	const changeFix = (option?: { label: string; value: string }) => {
		if (!option) return;
		change(option.value);
	};
	return (
		<Select value={{ value: fix, label: fix }} onValueChange={changeFix}>
			<SelectTrigger>
				<SelectValue className="text-foreground text-sm native:text-lg" placeholder="" />
			</SelectTrigger>
			<SelectContent className="z-20 bg-white" insets={contentInsets}>
				<SelectGroup>
					{Array.from({ length: 6 }).map((_, v) => (
						<SelectItem label={v.toString()} key={v} value={v.toString()}>
							{v}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
