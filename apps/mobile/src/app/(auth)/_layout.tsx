import { Stack } from "expo-router";
import { ThemeProvider } from "../../features/theme";
import { LogInPageHeader } from "../../pages/log-in";
import { WaveHeader } from "../../widgets/layout";

const AuthLayout = () => {
	return (
		<ThemeProvider statusBarStyle="dark" theme="light">
			<Stack
				screenOptions={{
					headerTransparent: true,
				}}
			>
				<Stack.Screen
					name="sign-up"
					options={{
						header: () => <WaveHeader title="Sign Up" enableBackButton backButtonLabel="Back" />,
					}}
				/>
				<Stack.Screen name="log-in" options={{ header: LogInPageHeader }} />
				<Stack.Screen name="onboarding" options={{ headerShown: false }} />
			</Stack>
		</ThemeProvider>
	);
};

export default AuthLayout;
