import { FlatList } from "react-native";
import { Additional, calcEffectiveAdds, calcTotalBeforeAdds, Item, useItems } from "./use-item";
import { AdditionalCard } from "./additional";
import { ItemCard } from "./items";

type Content =
	| {
			item: Item;
			type: "item";
			index: number;
	  }
	| {
			additional: Additional;
			type: "additional";
			index: number;
	  };

export function List() {
	const { items, additionals, fix, disc } = useItems();
	const totalBeforeAdds = calcTotalBeforeAdds(items, disc, fix);
	const { totalAfterAdds, addsVals } = calcEffectiveAdds(totalBeforeAdds, fix, additionals);
	const list: Content[] = [];
	let index = 0;
	for (const item of items) {
		list.push({
			type: "item",
			item,
			index,
		});
		index++;
	}
	index = 0;
	for (const additional of additionals) {
		list.push({
			type: "additional",
			additional,
			index,
		});
    index++;
	}
	return (
		<FlatList
			data={list}
			renderItem={({ item }) => {
				switch (item.type) {
					case "additional":
						return (
							<AdditionalCard
								additional={item.additional}
								effVal={addsVals[item.index]}
								index={item.index}
							/>
						);
					case "item":
						return <ItemCard index={item.index} item={item.item} />;
				}
			}}
			keyExtractor={(item) => {
				switch (item.type) {
					case "additional":
						return `additional-${item.additional.key}`;
					case "item":
						return `item-${item.item.key}`;
				}
			}}
			contentContainerStyle={{
				paddingBottom: 10,
			}}
		/>
	);
}
