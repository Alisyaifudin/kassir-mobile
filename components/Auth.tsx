import { useAsync } from "@/hooks/useAsync";
import React, { createContext, useContext, useState } from "react";
import { Session } from "@/lib/auth";

const AuthContext = createContext<{
	session: Session;
	set: {
		name: (name: string) => Promise<"Aplikasi bermasalah" | null>;
	};
} | null>(null);
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
	return <Wrapper session={state.data}>{children}</Wrapper>;
}

function Wrapper({ session: s, children }: { children: React.ReactNode; session: Session }) {
	const [session, setSession] = useState(s);
	const set = {
		name: async (name: string) => {
			const status = await Session.updateName(name);
			switch (status) {
				case "Fail":
					return "Aplikasi bermasalah";
				case "Success":
					setSession((prev) => ({ ...prev, name }));
					return null;
			}
		},
	};
	return <AuthProvider value={{ session, set }}>{children}</AuthProvider>;
}

export function useAuth() {
	const state = useAsync(() => Session.get());
	return state;
}

export function useSession() {
	const ctx = useContext(AuthContext);
	if (ctx === null) {
		throw new Error("Not authenticated yet");
	}
	return ctx;
}
