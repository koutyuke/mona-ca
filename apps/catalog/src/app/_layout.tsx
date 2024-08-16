import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "./global.css";
import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "../../../mobile/src/features/theme/components";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [loaded] = useFonts({
		SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<JotaiProvider>
			<ThemeProvider>
				<Stack>
					<Stack.Screen name="index" options={{ headerShown: false }} />
				</Stack>
			</ThemeProvider>
		</JotaiProvider>
	);
}
