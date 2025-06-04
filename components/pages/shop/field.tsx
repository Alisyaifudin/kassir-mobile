import { TextError } from "@/components/TextError";
import { Label } from "@/components/ui/label";
import { Control, Controller, ControllerRenderProps, Path } from "react-hook-form";
import { View } from "react-native";

export function Field<const Inputs extends Record<string, any>>({
	control,
	label,
	name,
	children,
	className,
	error,
}: {
	label: string;
	name: Path<Inputs>;
	control: Control<Inputs, any, Inputs>;
	className?: string;
	children: (field: ControllerRenderProps<Inputs, Path<Inputs>>) => React.ReactElement;
	error?: { show: boolean; msg: string };
}) {
	return (
		<View className={className}>
			<View>
				<Label>{label}</Label>
			</View>
			<View>
				<Controller control={control} render={({ field }) => children(field)} name={name} />
			</View>
			<TextError when={error !== undefined && error.show}>{error?.msg}</TextError>
		</View>
	);
}
