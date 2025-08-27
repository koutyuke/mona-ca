import "../layers/app/styles/global.css";

import { KiwiMaru_300Light, KiwiMaru_400Regular, KiwiMaru_500Medium } from "@expo-google-fonts/kiwi-maru";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
export { ErrorBoundary } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigationGuard } from "../features/navigation-guard";
import { AuthResetProvider, ResettableJotaiProvider } from "../layers/app/providers";
import { queryClient } from "../layers/app/store";
import { useNetworkStatus } from "../shared/api";

export const unstable_settings = {
	initialRouteName: "(app)",
};

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
	duration: 300,
	fade: true,
});

const RootLayoutNav = () => {
	const navigationGuard = useNavigationGuard();

	const [loaded, error] = useFonts({
		...FontAwesome.font,
		KiwiMaru_300Light,
		KiwiMaru_400Regular,
		KiwiMaru_500Medium,
	});

	useEffect(() => {
		if (loaded && !navigationGuard.loading) {
			SplashScreen.hide();
		}
	}, [loaded, navigationGuard.loading]);

	if (error) {
		console.error(error);
	}

	if (navigationGuard.loading) {
		return null;
	}

	return (
		<Stack>
			<Stack.Protected guard={navigationGuard.data === "app"}>
				<Stack.Screen name="(app)" options={{ headerShown: false }} />
			</Stack.Protected>
			<Stack.Protected guard={navigationGuard.data !== "app"}>
				<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			</Stack.Protected>
		</Stack>
	);
};

const RootLayout = () => {
	useNetworkStatus();

	return (
		<SafeAreaProvider>
			<KeyboardProvider>
				<QueryClientProvider client={queryClient}>
					<ResettableJotaiProvider>
						<AuthResetProvider>
							<RootLayoutNav />
						</AuthResetProvider>
					</ResettableJotaiProvider>
				</QueryClientProvider>
			</KeyboardProvider>
		</SafeAreaProvider>
	);
};

export default RootLayout;
