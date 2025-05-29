import { TextError } from "@/components/TextError";
import { Label } from "@/components/ui/label";
import { Control, Controller, ControllerRenderProps, Path } from "react-hook-form";
import { View } from "react-native";

export function Field<const Inputs extends Record<string, string>>({
	control,
	label,
	name,
	children,
	className,
	desc,
	error,
}: {
	label: string;
	name: Path<Inputs>;
	control: Control<Inputs, any, Inputs>;
	className?: string;
	children: (field: ControllerRenderProps<Inputs, Path<Inputs>>) => React.ReactElement;
	desc?: React.ReactNode;
	error?: { show: boolean; msg: string };
}) {
	return (
		<View className={className}>
			<View className="w-full">
				<Label>{label}</Label>
			</View>
			<View className="w-full">
				<Controller control={control} render={({ field }) => children(field)} name={name} />
			</View>
			<TextError when={error !== undefined && error.show}>{error?.msg}</TextError>
			{desc}
		</View>
	);
}
