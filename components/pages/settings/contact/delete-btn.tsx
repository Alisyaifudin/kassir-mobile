import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useAction } from "@/hooks/useAction";
import { useDB } from "@/hooks/useDB";
import { emitter } from "@/lib/event-emitter";
import { useState } from "react";
import { ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { X } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Show } from "@/components/Show";
import { TextError } from "@/components/TextError";

export function DeleteBtn({ social }: { social: DB.Social }) {
	const db = useDB();
	const [open, setOpen] = useState(false);
	const { error, loading, setError, action } = useAction("", async () =>
		db.social.delete(social.id)
	);
	const handleSubmit = async () => {
		const errMsg = await action();
		setError(errMsg);
		if (errMsg === null) {
			setOpen(false);
			emitter.emit("fetch-socials");
		}
	};
	return (
		<Dialog open={open} onOpenChange={(open) => setOpen(open)}>
			<DialogTrigger asChild>
				<Button variant="destructive" size="icon">
					<X color="white" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-full w-full min-w-full mb-36">
				<DialogHeader>
					<DialogTitle>Hapus Metode</DialogTitle>
					<DialogDescription>
						{">"} Nama: {social.name}
					</DialogDescription>
					<DialogDescription>
						{">"} Isian: {social.value}
					</DialogDescription>
					<TextError when={error !== null}>{error}</TextError>
				</DialogHeader>
				<DialogFooter className="flex flex-row justify-between">
					<DialogClose asChild>
						<Button variant="secondary">
							<Text>Batal</Text>
						</Button>
					</DialogClose>
					<Button variant="destructive" onPress={handleSubmit} className="flex flex-row gap-2">
						<Show when={loading}>
							<ActivityIndicator color="white" />
						</Show>
						<Text>Hapus</Text>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
