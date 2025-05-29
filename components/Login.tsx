import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "./ui/text";
import { useDB } from "@/hooks/useDB";
import { useAsync } from "@/hooks/useAsync";
import { Await } from "./Await";
import { TextError } from "./TextError";
import { ActivityIndicator, View } from "react-native";
import {
	Control,
	Controller,
	ControllerRenderProps,
	Path,
	SubmitHandler,
	useForm,
} from "react-hook-form";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Password } from "./ui/password";
import { useAction } from "@/hooks/useAction";
import { Show } from "./Show";
import { Session } from "@/lib/auth";
import { emitter } from "@/lib/event-emitter";

export function Login() {
	const state = useLogin();
	return (
		<SafeAreaView className="justify-center bg-zinc-900 flex-1 items-center pb-32">
			<Await state={state} Error={(error) => <TextError>{error}</TextError>}>
				{(cashiers) => {
					if (cashiers.length === 0) {
						return <FreshForm />;
					}
					return <LoginForm />;
				}}
			</Await>
		</SafeAreaView>
	);
}

function useLogin() {
	const db = useDB();
	const state = useAsync(() => db.cashier.getAll());
	return state;
}

function Field<const Inputs extends Record<string, string>>({
	control,
	error,
	label,
	name,
	children,
	className,
}: {
	label: string;
	name: Path<Inputs>;
	control: Control<Inputs, any, Inputs>;
	error?: {
		msg: string;
		show: boolean;
	};
	className?: string;
	children: (field: ControllerRenderProps<Inputs, Path<Inputs>>) => React.ReactElement;
}) {
	return (
		<View className={className}>
			<View className="w-full">
				<Label>{label}</Label>
			</View>
			<View className="w-full">
				<Controller control={control} render={({ field }) => children(field)} name={name} />
				<TextError when={error !== undefined && error.show}>{error?.msg}</TextError>
			</View>
		</View>
	);
}

type FreshInputs = {
	name: string;
	password: string;
	confirm: string;
};

function FreshForm() {
	const { control, handleSubmit } = useForm<FreshInputs>({
		defaultValues: { name: "", password: "", confirm: "" },
	});
	const db = useDB();
	const { error, loading, setError, action } = useAction(
		{ name: "", password: "", confirm: "" },
		(data: { name: string; password: string }) => {
			return db.cashier.insert({ name: data.name, password: data.password, role: "admin" });
		}
	);
	const onSubmit: SubmitHandler<FreshInputs> = async (raw) => {
		const { name, password, confirm } = raw;
		if (password !== confirm) {
			setError({ name: "", password: "Harus sama", confirm: "Harus sama" });
			return;
		}
		if (name.trim() === "") {
			setError({ name: "Harus ada", password: "", confirm: "" });
			return;
		}
		const errMsg = await action({ name: name.trim(), password });
		if (errMsg) {
			setError({ name: "", password: "", confirm: errMsg });
		}
		const errLogin = await Session.login(name, "admin");
		if (errLogin) {
			setError({ name: "", password: "", confirm: errLogin });
		} else {
			setError(null);
			emitter.emit("fetch-session");
		}
	};
	return (
		<View className="gap-2 w-full p-3 bg-white">
			<Text className="text-3xl font-bold">Selamat datang</Text>
			<Text>Silakan buat akun terlebih dahulu 😊</Text>
			<Field
				control={control}
				label="Nama"
				name="name"
				error={{ show: error !== null && error.name !== "", msg: error?.name ?? "" }}
			>
				{({ onChange, value, onBlur }) => (
					<Input onBlur={onBlur} onChangeText={onChange} value={value} />
				)}
			</Field>
			<Field
				control={control}
				label="Kata Sandi"
				name="password"
				error={{ show: error !== null && error.password !== "", msg: error?.password ?? "" }}
			>
				{({ onChange, value, onBlur }) => (
					<Password onBlur={onBlur} onChangeText={onChange} value={value} />
				)}
			</Field>
			<Field
				control={control}
				label="Ulangi Kata Sandi"
				name="confirm"
				error={{ show: error !== null && error.confirm !== "", msg: error?.confirm ?? "" }}
			>
				{({ onChange, value, onBlur }) => (
					<Password onBlur={onBlur} onChangeText={onChange} value={value} />
				)}
			</Field>
			<View className="items-end">
				<Button onPress={handleSubmit(onSubmit)} className="flex-row gap-2 items-center">
					<Show when={loading}>
						<ActivityIndicator color="white" />
					</Show>
					<Text>Button</Text>
				</Button>
			</View>
		</View>
	);
}

function LoginForm({}) {
	return <View></View>;
}
