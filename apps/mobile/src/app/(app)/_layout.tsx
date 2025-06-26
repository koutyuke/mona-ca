import { Stack } from "expo-router";
import { ThemeProvider } from "../../features/theme";

const AppLayout = () => {
	return (
		<ThemeProvider>
			<Stack>
				<Stack.Screen name="index" options={{ headerShown: false }} />
			</Stack>
		</ThemeProvider>
	);
};

export default AppLayout;
