import { Await } from "@/components/Await";
import { Show } from "@/components/Show";
import { TextError } from "@/components/TextError";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import { useAction } from "@/hooks/useAction";
import { useAsync } from "@/hooks/useAsync";
import { useDB } from "@/hooks/useDB";
import { COLOR } from "@/lib/constants";
import { emitter } from "@/lib/event-emitter";
import { image } from "@/lib/image";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, View } from "react-native";

export function ImageDetail({ product }: { product: DB.Product }) {
	const state = useImages(product.id);
	return (
		<Await state={state}>
			{(images) => (
				<View className="px-2" style={{ flex: 1 }}>
					<ImageBtn product={product} />
					<FlatList
						data={images}
						renderItem={({ item }) => (
							<View style={styles.container}>
								<Image source={{ uri: item.uri }} style={styles.image} resizeMode="contain" />
							</View>
						)}
						keyExtractor={(item) => item.id.toString()}
					/>
				</View>
			)}
		</Await>
	);
}

function useImages(id: number) {
	const db = useDB();
	const state = useAsync(async () => db.productImage.getByProductId(id), ["fetch-images"]);
	return state;
}

export function ImageBtn({ product }: { product: DB.Product }) {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<{
		uri: string;
		name: string;
		width: number;
		height: number;
	} | null>(null);
	const { load, save } = useActions();
	const handleClick = async () => {
		const [errMsg, selected] = await load.action();
		switch (errMsg) {
			case "Operasi dibatalkan":
				setSelected(null);
				return;
			case "Tidak diizinkan":
				Alert.alert(
					"Izin diperlukan",
					"Mohon maaf, izin untuk mengakses gambar di galeri diperlukan 🙏"
				);
				setSelected(null);
				return;
		}
		setSelected(selected);
	};

	const handleSubmit = async () => {
		if (selected === null) {
			return;
		}
		const errMsg = await save.action({ ...selected, productId: product.id });
		save.setError(errMsg);
		if (errMsg === null) {
			emitter.emit("fetch-images");
			setOpen(false);
		}
	};
	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (!open) {
					setSelected(null);
				}
				setOpen(open);
			}}
		>
			<DialogTrigger asChild>
				<Button variant="default" className="flex flex-row gap-2 items-center px-2">
					<Text>Tambahkan Gambar</Text>
					<Plus color="white" />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-full w-full min-w-full">
				<DialogHeader>
					<DialogTitle>Tambahkan Gambar</DialogTitle>
					<View style={styles.container}>
						<Show when={selected !== null} fallback={<View style={styles.empty} />}>
							<Image source={{ uri: selected?.uri }} style={styles.image} resizeMode="contain" />
						</Show>
					</View>
					<Button onPress={handleClick} variant="outline">
						<Text>Cari gambar</Text>
					</Button>
					<Show when={save.error !== null}>
						<TextError>{save.error}</TextError>
					</Show>
				</DialogHeader>
				<DialogFooter className="flex flex-row justify-between">
					<DialogClose asChild>
						<Button variant="secondary">
							<Text>Batal</Text>
						</Button>
					</DialogClose>
					<Button
						variant="default"
						className="flex flex-row gap-2"
						disabled={selected === null}
						onPress={handleSubmit}
					>
						<Show when={save.loading}>
							<ActivityIndicator color="white" />
						</Show>
						<Text>Simpan</Text>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function useActions() {
	const db = useDB();
	const load = useAction("", () => image.pick());
	const save = useAction(
		"",
		async (data: {
			uri: string;
			name: string;
			productId: number;
			width: number;
			height: number;
		}) => {
			const [errSave, uri] = await image.save(data.uri, data.name);
			if (errSave) {
				return errSave;
			}
			const errMsg = await db.productImage.insert({
				uri,
				created: Date.now(),
				height: data.height,
				width: data.width,
				productId: data.productId,
			});
			return errMsg;
		}
	);
	return { load, save };
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
		// objectFit: "cover",
	},
	empty: {
		width: "100%",
		height: "100%",
		backgroundColor: COLOR.zinc[200],
	},
});
