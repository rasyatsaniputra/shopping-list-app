import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import {
	Button,
	FAB,
	Modal,
	Portal,
	Text,
	TextInput,
} from "react-native-paper";
import ShoppingItemHeader from "../components/ShoppingItemHeader";
import ShoppingItemTile from "../components/ShoppingItemTile";
import { useAppTheme } from "./_layout";

export type ShoppingItem = {
	id: number;
	title: string;
	price: number;
	isBought: 1 | 0;
	createdAt: string;
};

type ShoppingItemFormData = {
	title: string;
	price: string;
};

const DATABASE_NAME = "DB_RPL4";
const TABLE_NAME = "shopping_items";

const db = SQLite.openDatabaseSync(DATABASE_NAME, { useNewConnection: true });

export default function HomeScreen() {
	const [items, setItems] = useState<ShoppingItem[]>([]);
	const [formData, setFormData] = useState<ShoppingItemFormData>({
		title: "",
		price: "",
	});
	const [editingItemId, setEditingItemId] = useState<number | null>(null);
	const [visible, setVisible] = useState(false);

	const {
		colors: { brandPrimary, onBrandPrimary },
	} = useAppTheme();

	const containerStyle = {
		backgroundColor: "white",
		padding: 24,
		margin: 24,
		borderRadius: 8,
	};

	const totalAmount = items.reduce((acc, cur) => acc + cur.price, 0);

	function showModal() {
		setVisible(true);
	}

	function hideModal() {
		setVisible(false);

		setTimeout(() => {
			clearForm();
			clearEdit();
		}, 300);
	}

	function clearForm() {
		setFormData({ title: "", price: "" });
	}

	function clearEdit() {
		setEditingItemId(null);
	}

	async function getItems() {
		try {
			const sql = `
        SELECT id, title, price, isBought, createdAt 
        FROM ${TABLE_NAME} 
        ORDER BY createdAt DESC
      `;
			const items = await db.getAllAsync<ShoppingItem>(sql);

			setItems(items ?? []);
		} catch (err) {
			console.error("Terjadi Kesalahan: ", err);
		}
	}

	async function addItem() {
		try {
			const title = formData.title.trim();
			const price = Number(formData.price);

			if (!title || formData.price === "" || Number.isNaN(price) || price < 0) {
				Alert.alert("Gagal Menambahkan", "Kolom tidak boleh kosong!");
				return;
			}

			const createdAt = new Date().toISOString();
			const insertValues = [title, price, createdAt];

			const sql = `
        INSERT INTO ${TABLE_NAME} (title, price, createdAt) VALUES 
        (?, ?, ?)
      `;
			const result = await db.runAsync(sql, insertValues);
			const newItem: ShoppingItem = {
				id: result.lastInsertRowId,
				title: title,
				price: price,
				isBought: 0,
				createdAt: createdAt,
			};

			setItems((prev) => [...prev, newItem]);

			hideModal();
		} catch (err) {
			console.error("Terjadi Kesalahan: ", err);
		}
	}

	async function updateItem() {
		try {
			const currentItem = items.find((item) => item.id === editingItemId);

			if (!currentItem) return;

			const title = formData.title.trim();
			const price = Number(formData.price);
			const id = editingItemId;

			if (!id) return;

			if (!title || formData.price === "" || Number.isNaN(price) || price < 0) {
				Alert.alert("Gagal Menambahkan", "Kolom tidak boleh kosong!");
				return;
			}

			const data = [title, price, id];
			const sql = `UPDATE ${TABLE_NAME} SET title = ?, price = ? WHERE id = ?`;

			await db.runAsync(sql, data);

			setItems((prev) =>
				prev.map((item) =>
					item.id === editingItemId
						? { ...item, title: title, price: price }
						: item,
				),
			);

			hideModal();
		} catch (err) {
			console.error("Terjadi Kesalahan: ", err);
		}
	}

	async function deleteItem(id: number) {
		try {
			if (!id) return;

			const sql = `DELETE FROM ${TABLE_NAME} WHERE id = ?`;

			await db.runAsync(sql, [id]);

			setItems((prev) => prev.filter((i) => i.id !== id));
		} catch (err) {
			console.error("Terjadi Kesalahan: ", err);
		}
	}

	async function saveItem() {
		try {
			if (!editingItemId) {
				await addItem();
				return;
			}

			await updateItem();
		} catch (err) {
			console.error("Terjadi Kesalahan: ", err);
		}
	}

	async function toggleItemStatus(id: number) {
		try {
			const currentItem = items.find((item) => item.id === id);

			if (!currentItem) return;

			const newStatus = currentItem.isBought ? 0 : 1;
			const data = [newStatus, id];

			const sql = `UPDATE ${TABLE_NAME} SET isBought = ? WHERE id = ?`;

			await db.runAsync(sql, [...data]);

			setItems((prev) =>
				prev.map((item) =>
					item.id === id ? { ...item, isBought: newStatus } : item,
				),
			);
		} catch (err) {
			console.error("Terjadi Kesalahan: ", err);
		}
	}

	async function init() {
		try {
			const sql = `
					CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						title TEXT NOT NULL,
						price INTEGER NOT NULL,
						isBought INTEGER NOT NULL DEFAULT 0,
						createdAt TEXT NOT NULL
					)`;
			await db.runAsync(sql);

			await getItems();
		} catch (err) {
			console.error("Terjadi Kesalahan: ", err);
		}
	}

	useEffect(() => {
		init();
	}, []);

	return (
		<View style={{ flex: 1 }}>
			<ShoppingItemHeader />

			<View style={{ margin: 16 }}>
				<Text>Total Belanja: Rp {totalAmount.toLocaleString("id")}</Text>
			</View>

			<Portal>
				<Modal
					visible={visible}
					onDismiss={hideModal}
					contentContainerStyle={containerStyle}
				>
					<Text
						variant="titleLarge"
						style={{
							marginBottom: 16,
							color: brandPrimary,
							fontWeight: 700,
							letterSpacing: 2,
						}}
					>
						{!editingItemId ? "Tambah Barang" : "Perbarui Barang"}
					</Text>
					<View style={{ gap: 16 }}>
						<TextInput
							mode="outlined"
							activeOutlineColor={brandPrimary}
							placeholder="Nama Barang"
							value={formData.title}
							onChangeText={(text) => setFormData({ ...formData, title: text })}
						/>
						<TextInput
							mode="outlined"
							activeOutlineColor={brandPrimary}
							placeholder="Harga Barang"
							value={formData.price}
							onChangeText={(text) => setFormData({ ...formData, price: text })}
							keyboardType="numeric"
						/>
					</View>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "flex-end",
							gap: 8,
							marginTop: 16,
						}}
					>
						<Button onPress={hideModal} textColor={brandPrimary}>
							Batal
						</Button>
						<Button
							onPress={saveItem}
							container={true}
							buttonColor={brandPrimary}
							textColor={onBrandPrimary}
							mode="contained"
							style={{ borderRadius: 8 }}
						>
							{!editingItemId ? "Tambah" : "Perbarui"}
						</Button>
					</View>
				</Modal>
			</Portal>

			<FlatList
				data={items}
				keyExtractor={(items) => items.id.toString()}
				renderItem={({ item }) => (
					<ShoppingItemTile
						item={item}
						onEdit={() => {
							setEditingItemId(item.id);
							setFormData({ title: item.title, price: String(item.price) });
							showModal();
						}}
						onDelete={deleteItem}
						onToggle={toggleItemStatus}
					/>
				)}
			/>

			<FAB
				icon="plus"
				style={{
					position: "absolute",
					margin: 16,
					marginBottom: 56,
					right: 0,
					bottom: 0,
					backgroundColor: brandPrimary,
					borderRadius: 8,
				}}
				onPress={() => showModal()}
				color={onBrandPrimary}
			/>
		</View>
	);
}
