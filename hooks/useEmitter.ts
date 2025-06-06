import { emitter } from "@/lib/event-emitter";
import { useEffect, useState } from "react";

export function useEmitter(event: string, deps: React.DependencyList) {
	const [update, setUpdate] = useState(false);
	useEffect(() => {
		const listener = () => {
			setUpdate((prev) => !prev);
		};
		emitter.on(event, listener);
		return () => {
			emitter.off(event, listener);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deps]);
	return update;
}
