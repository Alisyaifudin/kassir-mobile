import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Method, METHOD_NAMES, METHODS } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react-native";
import { View } from "react-native";
import { useMethod } from "./use-params";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { useEffect } from "react";
import { Show } from "@/components/Show";

export function Filter({
	methods,
	setMethods,
}: {
	methods: DB.MethodType[];
	setMethods: (methods: DB.MethodType[]) => void;
}) {
	const methodRaw = useMethod();
	const router = useRouter();
	const method = getMethod(methods, methodRaw);
	useEffect(() => {
		setMethods(methods);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [methods]);
	const handleClickSingle = (m: Method) => () => {
		if (method?.type === m && method.id === null) {
			router.setParams({
				id: undefined,
				type: undefined,
			});
			return;
		}
		router.setParams({
			type: m,
			id: undefined,
		});
	};
	const handleClickMultiple = (m: Method, id: number) => () => {
		if (method?.type === m && method.id === id) {
			router.setParams({
				id: undefined,
				type: undefined,
			});
			return;
		}
		router.setParams({
			type: m,
			id: id,
		});
	};
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" className="flex-row gap-2">
					<Show when={method !== null}>
						<Text>{METHOD_NAMES[method?.type ?? "cash"]}</Text>
					</Show>
					<SlidersHorizontal />
				</Button>
			</DialogTrigger>
			<DialogContent className="text-3xl w-full min-w-full">
				<DialogHeader>
					<DialogTitle className="text-3xl">Filter Metode Pembayaran</DialogTitle>
					<View className="flex flex-col gap-5">
						{METHODS.map((n) => {
							const methodTypes = methods.filter((m) => m.method === n);
							return (
								<View key={n} className="flex flex-col gap-2">
									<Button
										variant={method?.type === n && method.id === null ? "default" : "outline"}
										className="w-fit p-1 px-3 font-bold text-3xl"
										onPress={handleClickSingle(n)}
									>
										<Text>{METHOD_NAMES[n]}</Text>
									</Button>
									<View className="flex flex-row items-center gap-3 flex-wrap">
										{methodTypes.map((m) => (
											<View key={m.id} className="flex flex-row gap-2 items-center pl-3">
												<Button
													variant={method?.type === n && method.id === m.id ? "default" : "outline"}
													className=" w-fit p-1"
													onPress={handleClickMultiple(n, m.id)}
												>
													<Text>{m.name}</Text>
												</Button>
											</View>
										))}
									</View>
								</View>
							);
						})}
					</View>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}

function getMethod(
	methods: DB.MethodType[],
	method: {
		type: "cash" | "transfer" | "debit" | "qris";
		id: number | null;
	} | null
): {
	type: "cash" | "transfer" | "debit" | "qris";
	id: number | null;
} | null {
	if (method === null) {
		return null;
	}
	if (method.id === null) {
		return method;
	}
	const find = methods.find((m) => m.id === method.id);
	if (find) {
		return method;
	}
	return {
		id: null,
		type: "cash",
	};
}
