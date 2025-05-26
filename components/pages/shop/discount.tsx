import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { Plus, X } from "lucide-react-native";
import { View } from "react-native";
import { Item, useItems } from "./use-item";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounceCallback } from "@react-hook/debounce";
import { produce } from "immer";
import { SelectKind } from "./select-kind";

export function DiscountBtn({ index, item }: { index: number; item: Item }) {
	const { set } = useItems();
	const [discVals, setDiscVals] = useState(item.discs.map((d) => d.value.toString()));
	const debounce = useDebounceCallback((i: number, value: string) => {
		set.items.disc.value(index, i, value);
	}, 300);
	const handleAdd = () => {
		set.items.disc.add(index);
	};
	const handleChange = (i: number, s: string) => {
		setDiscVals((prev) =>
			produce(prev, (draft) => {
				if (s.trim() === "" || !isNaN(Number(s))) {
					const num = Number(s);
					if (num < 0) {
						return;
					}
					switch (item.discs[i].kind) {
						case "number":
							if (num > item.price * item.qty) {
								draft[i] = (item.price * item.qty).toString();
								return;
							}
							break;
						case "percent":
							if (num > 100) {
								draft[i] = "100";
								return;
							}
					}
					draft[i] = s;
				}
			})
		);
		debounce(i, s);
	};
	const handleDel = (i: number) => () => {
		setDiscVals((prev) => prev.filter((_, j) => j !== i));
		set.items.disc.remove(index, i);
	};
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="secondary" className="flex-row">
					<Text>Diskon</Text>
					<Plus />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-full w-full min-w-full">
				<DialogHeader>
					<DialogTitle>Diskon</DialogTitle>
					{item.discs.map((disc, i) => (
						<View key={i} className="flex-row gap-2 justify-between">
							<Input
								keyboardType="numeric"
								className="flex-1"
								value={discVals[i]}
								onChangeText={(s) => handleChange(i, s)}
							/>
							<SelectKind kind={disc.kind} change={(kind) => set.items.disc.kind(index, i, kind)} />
							<Button variant="destructive" size="icon" onPress={handleDel(i)}>
								<X color="white" />
							</Button>
						</View>
					))}
				</DialogHeader>
				<DialogFooter className="flex flex-row justify-end">
					<Button onPress={handleAdd} className="flex flex-row gap-2">
						<Plus color="white" />
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

