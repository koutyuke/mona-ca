import { KiwiMaru_300Light, KiwiMaru_400Regular, KiwiMaru_500Medium, useFonts } from "@expo-google-fonts/kiwi-maru";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Provider as JotaiProvider } from "jotai";
import { useEffect } from "react";
import { ThemeProvider } from "../../../mobile/src/features/theme";

import "react-native-reanimated";
import "./global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
	const [fontsLoaded, fontError] = useFonts({
		KiwiMaru_300Light,
		KiwiMaru_400Regular,
		KiwiMaru_500Medium,
	});

	useEffect(() => {
		if (fontsLoaded || fontError) {
			SplashScreen.hide();
		}
	}, [fontsLoaded, fontError]);

	if (!fontsLoaded) {
		return null;
	}

	if (fontError) {
		console.error(fontError);
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
};

export default RootLayout;
