import { Context } from "@/components/RootProvider";
import { useContext } from "react";

export function useDB() {
	const v = useContext(Context);
	if (v === null) {
		throw new Error("Diluar root");
	}
	return v.db;
}
