import { Text, View } from "react-native";
import { Checkbox, IconButton } from "react-native-paper";
import type { ShoppingItem } from "../app";
import { useAppTheme } from "../app/_layout";

type ShoppingItemTileProps = {
	item: ShoppingItem;
	onEdit: () => void;
	onDelete: (id: number) => void;
	onToggle: (id: number) => void;
};

export default function ShoppingItemTile({
	item,
	onEdit,
	onDelete,
	onToggle,
}: ShoppingItemTileProps) {
	const {
		colors: { brandPrimary },
	} = useAppTheme();

	return (
		<View
			style={{
				flexDirection: "row",
				justifyContent: "space-between",
				alignItems: "center",
				backgroundColor: "white",
				padding: 16,
			}}
		>
			<View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
				<Checkbox
					status={item.isBought ? "checked" : "unchecked"}
					onPress={() => onToggle(item.id)}
					color={brandPrimary}
				/>
				<View style={{ gap: 8 }}>
					<Text
						style={{
							fontSize: 16,
							textDecorationLine: item.isBought ? "line-through" : "none",
							color: item.isBought ? "gray" : "",
						}}
					>
						{item.title}
					</Text>
					<Text>Rp {item.price.toLocaleString("id")}</Text>
				</View>
			</View>
			<View style={{ flexDirection: "row" }}>
				<IconButton icon="pencil" size={20} onPress={() => onEdit()} />
				<IconButton icon="delete" size={20} onPress={() => onDelete(item.id)} />
			</View>
		</View>
	);
}
