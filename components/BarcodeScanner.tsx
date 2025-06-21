import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { View } from "react-native";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ScanBarcode } from "lucide-react-native";
import { useState } from "react";

export function BarcodeScanner({ onScan }: { onScan: (v: string) => void }) {
	const [open, setOpen] = useState(false);
	return (
		<Dialog open={open} onOpenChange={(open) => setOpen(open)}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<ScanBarcode />
				</Button>
			</DialogTrigger>
			<DialogContent
				className="w-full min-w-full h-full p-0 border-0"
				// overlayClass="top-16 right-0 left-0 bottom-0"
			>
				<Content onScan={onScan} close={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}

function Content({ onScan, close }: { onScan: (v: string) => void; close: () => void }) {
	const handleScan = (e: BarcodeScanningResult) => {
		onScan(e.data);
		close();
	};
	const [permission, requestPermission] = useCameraPermissions();
	if (!permission) {
		// Camera permissions are still loading.
		return <View />;
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet.
		return (
			<View className="flex-1 justify-center">
				<Text className="text-center pb-10">Butuh Izin Kamera</Text>
				<Button onPress={requestPermission}>
					<Text>Izin</Text>
				</Button>
			</View>
		);
	}
	return (
		<View>
			<CameraView
				barcodeScannerSettings={{
					barcodeTypes: [
						"ean13",
						"aztec",
						"codabar",
						"code128",
						"code39",
						"code93",
						"ean8",
						"itf14",
						"pdf417",
						"upc_a",
						"upc_e",
					],
				}}
				onBarcodeScanned={handleScan}
				style={{ flex: 1 }}
				mode="picture"
				facing="back"
				ratio="1:1"
				active
			></CameraView>
		</View>
	);
}
