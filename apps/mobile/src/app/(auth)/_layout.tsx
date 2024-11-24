import { Stack } from "expo-router";
import { CustomThemeProvider } from "../../features/theme";

const AuthLayout = () => {
	return (
		<CustomThemeProvider statusBarStyle="light" styleTheme="light">
			<Stack
				screenOptions={{
					headerTransparent: true,
				}}
			>
				<Stack.Screen name="sign-up" options={{ headerShown: false }} />
				<Stack.Screen name="log-in" options={{ headerShown: false }} />
			</Stack>
		</CustomThemeProvider>
	);
};

export default AuthLayout;
