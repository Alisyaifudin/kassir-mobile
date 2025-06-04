import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useAction } from "@/hooks/useAction";
import { useDB } from "@/hooks/useDB";
import { emitter } from "@/lib/event-emitter";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Plus } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Show } from "@/components/Show";
import { Label } from "@/components/ui/label";
import { TextError } from "@/components/TextError";

export function NewBtn() {
	const db = useDB();
	const [name, setName] = useState("");
	const [open, setOpen] = useState(false);
	const { error, loading, setError, action } = useAction("", async (name: string) =>
		db.cashier.insert({ name, password: "", role: "user" })
	);
	const handleSubmit = async () => {
		if (name.trim() === "") {
			setError("Harus ada");
			return;
		}
		const [errMsg] = await action(name);
		setError(errMsg);
		if (errMsg === null) {
			emitter.emit("fetch-cashiers");
			setOpen(false);
			setName("");
		}
	};
	return (
		<Dialog open={open} onOpenChange={(open) => setOpen(open)}>
			<DialogTrigger asChild>
				<Plus size={24} color="white" />
			</DialogTrigger>
			<DialogContent className="max-w-full w-full min-w-full mb-36">
				<DialogHeader>
					<DialogTitle>Kasir Baru</DialogTitle>
					<View className="gap-1">
						<Label>Nama</Label>
						<Input value={name} onChangeText={setName} />
						<TextError when={error !== null && error !== ""}>{error}</TextError>
					</View>
				</DialogHeader>
				<DialogFooter className="flex flex-row justify-between">
					<DialogClose asChild>
						<Button variant="secondary">
							<Text>Batal</Text>
						</Button>
					</DialogClose>
					<Button onPress={handleSubmit} className="flex flex-row gap-2">
						<Show when={loading}>
							<ActivityIndicator color="white" />
						</Show>
						<Text>Simpan</Text>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
