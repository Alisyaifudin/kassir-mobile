import { Show } from "@/components/Show";
import { TextError } from "@/components/TextError";
import { Button } from "@/components/ui/button";
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
import { Text } from "@/components/ui/text";
import { useAction } from "@/hooks/useAction";
import { useDB } from "@/hooks/useDB";
import { emitter } from "@/lib/event-emitter";
import { useRouter } from "expo-router";
import { ActivityIndicator } from "react-native";

export function DeleteBtn({ product }: { product: DB.Product }) {
	const db = useDB();
	const router = useRouter();
	const { error, loading, setError, action } = useAction("", async () =>
		db.product.delete(product.id)
	);
	const handleSubmit = async () => {
		const errMsg = await action();
		setError(errMsg);
		if (errMsg === null) {
			setError(null);
			db.product.revalidate("all");
			emitter.emit("fetch-products");
			router.back();
		}
	};
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="destructive">
					<Text>Hapus</Text>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-full w-full min-w-full">
				<DialogHeader>
					<DialogTitle>Hapus Barang</DialogTitle>
					<DialogDescription>Kamu akan menghapus:</DialogDescription>
					<DialogDescription>
						{">"} Nama: {product.name}
					</DialogDescription>
					<DialogDescription>
						{">"} Harga: Rp{product.price.toLocaleString("id-ID")}
					</DialogDescription>
					<Show when={error !== null}>
						<TextError>{error}</TextError>
					</Show>
				</DialogHeader>
				<DialogFooter className="flex flex-row justify-between">
					<DialogClose asChild>
						<Button>
							<Text>Batal</Text>
						</Button>
					</DialogClose>
					<DialogClose asChild>
						<Button variant="destructive" onPress={handleSubmit} className="flex flex-row gap-2">
							<Show when={loading}>
								<ActivityIndicator color="white" />
							</Show>
							<Text>Hapus</Text>
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
