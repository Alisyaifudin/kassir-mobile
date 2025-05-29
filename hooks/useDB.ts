import { Database } from "@/database";
import { createContext, useContext } from "react";

export const Context = createContext<{
	db: Database;
} | null>(null);

export function useDB() {
	const v = useContext(Context);
	if (v === null) {
		throw new Error("Diluar root");
	}
	return v.db;
}
