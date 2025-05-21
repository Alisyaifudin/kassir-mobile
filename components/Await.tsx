import type { AsyncState } from "@/hooks/useAsync";
import { Result } from "@/lib/utils";
import { TextError } from "./TextError";
type AwaitDangerousProps<T> = {
	state: AsyncState<T>;
	Loading?: React.ReactNode;
	Error?: React.ReactNode;
	children: (data: T) => React.ReactNode;
};

export function AwaitDangerous<T>({
	state: { data, error, loading },
	Loading = null,
	Error = null,
	children,
}: AwaitDangerousProps<T>) {
	if (loading) {
		return Loading;
	}
	if (data === null) {
		console.error(error);
		return Error;
	}
	return <>{children(data)}</>;
}

type AwaitProps<E, T> = {
	state: AsyncState<Result<E, T>>;
	Loading?: React.ReactNode;
	Error?: (error: E) => React.ReactNode;
	children: (data: T) => React.ReactNode;
};

export function Await<E, T>({
	state: { data: awaited, error, loading },
	Loading = null,
	Error = () => null,
	children,
}: AwaitProps<E, T>) {
	if (loading) {
		return Loading;
	}
	if (awaited === null) {
		console.error(error);
		return <TextError>Aplikasi error</TextError>;
	}
	const [errMsg, data] = awaited;
	if (errMsg !== null) {
		console.error(error);
		return Error(errMsg);
	}
	return <>{children(data!)}</>;
}
