import { Appbar } from "react-native-paper";
import { useAppTheme } from "../app/_layout";

export default function ShoppingItemHeader() {
	const {
		colors: { brandPrimary, onBrandPrimary },
	} = useAppTheme();

	return (
		<Appbar.Header style={{ backgroundColor: brandPrimary }}>
			<Appbar.Content title="Daftar Belanja" color={onBrandPrimary} />
		</Appbar.Header>
	);
}
