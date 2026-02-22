import { Stack } from "expo-router";
import { MD3LightTheme, PaperProvider, useTheme } from "react-native-paper";

const theme = {
	...MD3LightTheme,
	custom: "property",
	colors: {
		...MD3LightTheme.colors,
		brandPrimary: "#ED6A5E",
		onBrandPrimary: "#FFFFFF",
	},
};

export const useAppTheme = () => useTheme<AppTheme>();

export type AppTheme = typeof theme;

export default function RootLayout() {
	return (
		<PaperProvider theme={theme}>
			<Stack screenOptions={{ headerShown: false }} />
		</PaperProvider>
	);
}
