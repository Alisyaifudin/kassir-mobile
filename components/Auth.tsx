import { useAsync } from "@/hooks/useAsync";
import { createContext, useContext } from "react";
import { Session } from "@/lib/auth";

const AuthContext = createContext<{ session: Session } | null>(null);
const AuthProvider = AuthContext.Provider;

type AuthProps = {
	Loading?: React.ReactNode;
	Login: React.ReactNode;
	children: React.ReactNode;
};

export function Auth({ Loading = null, children, Login }: AuthProps) {
	const state = useAuth();
	if (state.loading) {
		return Loading;
	}
	if (state.data === null) {
		return Login;
	}
	return <AuthProvider value={{ session: state.data }}>{children}</AuthProvider>;
}

export function useAuth() {
	const state = useAsync(() => Session.get(), ["fetch-session"]);
	return state;
}

export function useSession() {
	const ctx = useContext(AuthContext);
	if (ctx === null) {
		throw new Error("Not authenticated yet");
	}
	return ctx.session;
}
