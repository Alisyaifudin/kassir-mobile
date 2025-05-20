import { Database, generateDB } from "@/database";
import { useSQLiteContext } from "expo-sqlite";

import { createContext, useEffect, useState } from "react";

export const Context = createContext<{
	db: Database;
} | null>(null);

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
	return <Context.Provider value={{ db }}>{children}</Context.Provider>;
}
