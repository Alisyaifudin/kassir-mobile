import { Label } from "@/components/ui/label";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { numeric } from "@/lib/utils";
import { useEffect, useState } from "react";

export function SelectFix() {
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 10,
		right: 10,
	};
	const [fix, setFix] = useState(0);
	useEffect(() => {
		getFixLocal().then((fix) => setFix(fix));
	}, []);
	const changeFix = (option?: { label: string; value: string }) => {
		if (!option) return;
		const parsed = numeric.safeParse(option.value);
		const fix = parsed.success ? parsed.data : 0;
		setFix(fix);
		setFixLocal(fix);
	};
	return (
		<View className="flex-row items-center gap-2">
			<Label>Akurasi desimal</Label>
			<Select value={{ value: fix.toString(), label: fix.toString() }} onValueChange={changeFix}>
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
		</View>
	);
}

export async function getFixLocal(): Promise<number> {
	try {
		const raw = await AsyncStorage.getItem(`fix`);
		const num = Number(raw);
		if (raw === null || isNaN(num) || !Number.isInteger(num)) return 0;
		return num;
	} catch (error) {
		console.error(error);
		await AsyncStorage.removeItem(`fix`);
		return 0;
	}
}

async function setFixLocal(fix: number) {
	try {
		await AsyncStorage.setItem(`fix`, fix.toString());
	} catch (error) {
		console.error(error);
	}
}
