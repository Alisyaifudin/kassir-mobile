import { Database, generateDB } from "@/database";
import { useSQLiteContext } from "expo-sqlite";

import { useEffect, useState } from "react";
import { Auth } from "./Auth";
import { Login } from "./Login";
import { Context } from "@/hooks/useDB";

export function RootProvider({ children }: { children: React.ReactNode }) {
	const [db, setDB] = useState<null | Database>(null);
	const dbRaw = useSQLiteContext();
	useEffect(() => {
		if (dbRaw) {
			const db = generateDB(dbRaw);
			setDB(db);
		}
	}, [dbRaw]);
	if (db === null) return null;
	return (
		<Context.Provider value={{ db }}>
			<Auth Login={<Login />}>{children}</Auth>
		</Context.Provider>
	);
}
