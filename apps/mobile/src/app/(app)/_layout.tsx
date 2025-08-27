import { Stack } from "expo-router";
import { ThemeProvider } from "../../layers/app/providers";

const AppLayout = () => {
	console.log("app layout");
	return (
		<ThemeProvider>
			<Stack>
				<Stack.Screen name="index" options={{ headerShown: false }} />
			</Stack>
		</ThemeProvider>
	);
};

export default AppLayout;
