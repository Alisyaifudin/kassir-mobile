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
import { image } from "@/lib/image";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

export function DeleteItemBtn({ product }: { product: DB.Product }) {
	const db = useDB();
	const router = useRouter();
	const { error, loading, setError, action } = useAction("", async () => {
		const [errImgs, imgs] = await db.productImage.getByProductId(product.id);
		if (errImgs) return errImgs;
		const uris = imgs.map((m) => m.uri);
		const res = await Promise.all([
			db.product.delete(product.id),
			db.productImage.deleteByProductId(product.id, uris),
			image.deleleMany(uris),
		]);
		for (const errMsg of res) {
			return errMsg;
		}
		return null;
	});
	const handleSubmit = async () => {
		const errMsg = await action();
		setError(errMsg);
		if (errMsg === null) {
			setError(null);
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

export function DeleteImgBtn({ img }: { img: DB.ProductImage }) {
	const db = useDB();
	const [open, setOpen] = useState(false);
	const { error, loading, setError, action } = useAction("", async () => {
		const errDel = await image.del(img.uri);
		if (errDel) {
			return errDel;
		}
		const errMsg = await db.productImage.delete(img.uri);
		return errMsg;
	});
	const handleSubmit = async () => {
		const errMsg = await action();
		setError(errMsg);
		if (errMsg === null) {
			emitter.emit("fetch-images");
			setOpen(false);
		}
	};
	return (
		<Dialog open={open} onOpenChange={(open) => setOpen(open)}>
			<DialogTrigger asChild>
				<Button variant="destructive" size="icon" className="absolute top-0 right-0 z-10">
					<X color="white" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-full w-full min-w-full">
				<DialogHeader>
					<DialogTitle>Hapus Gambar</DialogTitle>
					<View style={styles.container}>
						<Image source={{ uri: img.uri }} style={styles.image} resizeMode="contain" />
					</View>
					<Show when={error !== null}>
						<TextError>{error}</TextError>
					</Show>
				</DialogHeader>
				<DialogFooter className="flex flex-row justify-between">
					<DialogClose asChild>
						<Button variant="secondary">
							<Text>Batal</Text>
						</Button>
					</DialogClose>
					<Button variant="destructive" className="flex flex-row gap-2" onPress={handleSubmit}>
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
const styles = StyleSheet.create({
	container: {
		width: "100%",
		aspectRatio: 1,
		overflow: "hidden",
	},
	image: {
		width: "100%",
		height: "100%",
	},
});
