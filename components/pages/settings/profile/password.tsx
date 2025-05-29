import { useSession } from "@/components/Auth";
import { Show } from "@/components/Show";
import { TextError } from "@/components/TextError";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAction } from "@/hooks/useAction";
import { useDB } from "@/hooks/useDB";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Password } from "@/components/ui/password";

export function PasswordForm() {
	const { session } = useSession();
	const [password, setPassword] = useState("");
	const db = useDB();
	const { error, loading, setError, action } = useAction("", (password: string) => {
		return db.cashier.updatePassword(session.id, password);
	});
	const handleSubmit = async () => {
		const errMsg = await action(password);
		setError(errMsg);
    setPassword("")
	};
	return (
		<Accordion type="single" collapsible className="w-full max-w-sm native:max-w-full px-2">
			<AccordionItem value="item-1">
				<AccordionTrigger>
					<Text>Ganti Kata Sandi</Text>
				</AccordionTrigger>
				<AccordionContent>
					<View className="gap-2 p-2">
						<Label>Kata Sandi Baru</Label>
						<Password className="flex-1" value={password} onChangeText={setPassword} />
					</View>
					<TextError when={error !== null && error !== ""}>{error}</TextError>
					<View className="items-end p-2">
						<Button onPress={handleSubmit} className="flex-row gap-2 items-center">
							<Show when={loading}>
								<ActivityIndicator color="white" />
							</Show>
							<Text>Simpan</Text>
						</Button>
					</View>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
