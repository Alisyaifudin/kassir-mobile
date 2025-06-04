import { FlatList, View } from "react-native";
import { FAB } from "@/components/Fab";
import { NewBtn } from "./new-btn";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Text } from "@/components/ui/text";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { DeleteBtn } from "./delete-btn";

export function MoneyList({ money, kind }: { money: DB.Money[]; kind: DB.MoneyKind }) {
	return (
		<View className="flex-1">
			<Table aria-labelledby="money" className="flex-1">
				<TableHeader>
					<TableRow>
						<TableHead style={{ width: 100 }}>
							<Text>Tanggal</Text>
						</TableHead>
						<TableHead className="items-center" style={{ width: 60 }}>
							<Text>Waktu</Text>
						</TableHead>
						<TableHead className="flex-1 items-end">
							<Text>Nilai</Text>
						</TableHead>
						<TableHead style={{ width: 50 }}></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className="flex-1">
					<FlatList
						className="flex-1 "
						data={money}
						keyExtractor={(item) => item.timestamp.toString()}
						contentContainerStyle={{ paddingBottom: 100 }}
						renderItem={({ item, index }) => (
							<TableRow
								key={item.timestamp}
								className={cn("active:bg-secondary", index % 2 && "bg-muted/40 ")}
							>
								<TableCell style={{ width: 100 }} className="justify-center ">
									<Text>{formatDate(item.timestamp)}</Text>
								</TableCell>
								<TableCell style={{ width: 60 }} className="justify-center items-center">
									<Text>{formatTime(item.timestamp)}</Text>
								</TableCell>
								<TableCell className="flex-1 items-end justify-center">
									<Text>{item.value.toLocaleString("id-ID")}</Text>
								</TableCell>
								<TableCell style={{ width: 50 }} className="items-end ">
									<DeleteBtn money={item} />
								</TableCell>
							</TableRow>
						)}
					/>
				</TableBody>
			</Table>
			<FAB>
				<NewBtn kind={kind} />
			</FAB>
		</View>
	);
}
