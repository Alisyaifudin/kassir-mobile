import { Label } from "@/components/ui/label";
import { Control, Controller, ControllerRenderProps, Path } from "react-hook-form";
import { View } from "react-native";

export function Field<const Inputs extends Record<string, string>>({
  control,
  label,
  name,
  children,
  className,
}: {
  label: string;
  name: Path<Inputs>;
  control: Control<Inputs, any, Inputs>;
  className?: string;
  children: (field: ControllerRenderProps<Inputs, Path<Inputs>>) => React.ReactElement;
}) {
  return (
    <View className={className}>
      <View className="w-full">
        <Label>{label}</Label>
      </View>
      <View className="w-full">
        <Controller control={control} render={({ field }) => children(field)} name={name} />
      </View>
    </View>
  );
}