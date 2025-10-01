import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Provider as JotaiProvider } from "jotai";
import { useEffect } from "react";
import { ThemeProvider } from "../../../mobile/src/layers/app/providers";

import "react-native-reanimated";
import "./global.css";
import { View } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
	useEffect(() => {
		SplashScreen.hide();
	}, []);

	return (
		<View className="ios:ios android:android h-full w-full">
			<JotaiProvider>
				<ThemeProvider>
					<Stack>
						<Stack.Screen name="index" options={{ headerShown: false }} />
					</Stack>
				</ThemeProvider>
			</JotaiProvider>
		</View>
	);
};

export default RootLayout;
