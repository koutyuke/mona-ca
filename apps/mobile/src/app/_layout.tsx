import "../layers/app/styles/global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

export { ErrorBoundary } from "expo-router";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { View } from "react-native";
import { AuthResetProvider, ResettableJotaiProvider } from "../layers/app/providers";
import { queryClient } from "../layers/app/store";
import { useNavigationGuard } from "../layers/features/auth";
import { useNetworkStatus } from "../layers/shared/api";

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

	useNetworkStatus();

	useEffect(() => {
		if (!navigationGuard.loading) {
			SplashScreen.hide();
		}
	}, [navigationGuard.loading]);

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
	return (
		<View className="ios:ios android:android h-full w-full">
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
		</View>
	);
};

export default RootLayout;
