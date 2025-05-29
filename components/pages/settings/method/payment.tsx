import { View } from "react-native";
import { FAB } from "@/components/Fab";
import { useDB } from "@/hooks/useDB";
import { useAsync } from "@/hooks/useAsync";
import { Await } from "@/components/Await";
import { Card } from "./card";
import { NewBtn } from "./new-btn";
export function PaymentMethod({ method }: { method: DB.Method }) {
	const state = useMethods();
	return (
		<View className="flex-1">
			<Await state={state}>
				{(methods) => (
					<View className="gap-2 px-2">
						{methods
							.filter((m) => m.method === method)
							.map((method) => (
								<Card key={method.id} method={method} />
							))}
					</View>
				)}
			</Await>
			<FAB>
				<NewBtn method={method} />
			</FAB>
		</View>
	);
}

function useMethods() {
	const db = useDB();
	const state = useAsync(() => db.method.get(), ["fetch-methods"]);
	return state;
}
