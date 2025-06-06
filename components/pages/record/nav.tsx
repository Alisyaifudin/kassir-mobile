import { Calendar } from "@/components/Calendar";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { Filter } from "./filter";
import { useDB } from "@/hooks/useDB";
import { useAsync } from "@/hooks/useAsync";
import { Await } from "@/components/Await";
import { formatDate, getDayName } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Temporal } from "temporal-polyfill";

export function Nav({
	start,
	setMethods,
}: {
	start: number;
	setMethods: (methods: DB.MethodType[]) => void;
}) {
	const router = useRouter();
	const setTime = (time: number) => {
		router.setParams({ time: time.toString() });
	};
	const tz = Temporal.Now.timeZoneId();
	const date = Temporal.Instant.fromEpochMilliseconds(start).toZonedDateTimeISO(tz).startOfDay();
	const handlePrev = () => {
		setTime(date.subtract(Temporal.Duration.from({ days: 1 })).epochMilliseconds);
	};
	const handleNext = () => {
		setTime(date.add(Temporal.Duration.from({ days: 1 })).epochMilliseconds);
	};
	const state = useMethods();
	return (
		<View className="flex-row items-center gap-2 justify-between px-0.5">
			<View className="flex-row items-center gap-1">
				<Button onPress={handlePrev} size="icon">
					<ChevronLeft color="white" />
				</Button>
				<Calendar mode="day" time={start} onChange={setTime}>
					<Text>
						{getDayName(start)} {formatDate(start, "long")}
					</Text>
				</Calendar>
				<Button onPress={handleNext} size="icon">
					<ChevronRight color="white" />
				</Button>
			</View>
			<Await state={state}>
				{(methods) => <Filter methods={methods} setMethods={setMethods} />}
			</Await>
		</View>
	);
}

function useMethods() {
	const db = useDB();
	const state = useAsync(() => db.method.get());
	return state;
}
