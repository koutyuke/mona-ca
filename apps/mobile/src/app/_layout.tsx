import { KiwiMaru_300Light, KiwiMaru_400Regular, KiwiMaru_500Medium } from "@expo-google-fonts/kiwi-maru";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Provider as JotaiProvider } from "jotai";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
export { ErrorBoundary } from "expo-router";

import "../styles/global.css";

export const unstable_settings = {
	initialRouteName: "(auth)/onboarding",
};

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
	const [loaded, error] = useFonts({
		...FontAwesome.font,
		KiwiMaru_300Light,
		KiwiMaru_400Regular,
		KiwiMaru_500Medium,
	});

	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hide();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return <RootLayoutNav />;
};

const RootLayoutNav = () => {
	return (
		<SafeAreaProvider>
			<KeyboardProvider>
				<JotaiProvider>
					<Stack>
						<Stack.Screen name="index" options={{ headerShown: false }} />
						<Stack.Screen name="(auth)" options={{ headerShown: false }} />
					</Stack>
				</JotaiProvider>
			</KeyboardProvider>
		</SafeAreaProvider>
	);
};

export default RootLayout;
