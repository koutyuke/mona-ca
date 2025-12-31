import { Stack } from "expo-router";
import { ThemeProvider } from "../../layers/app/providers";
import { useNavigationGuard } from "../../layers/features/auth";
import { LoginPageHeader } from "../../layers/pages/login";
import { WaveHeader } from "../../layers/widgets/layout";

export const unstable_settings = {
	initialRouteName: "onboarding",
};

const AuthLayout = () => {
	const navigationGuard = useNavigationGuard();

	return (
		<ThemeProvider statusBarStyle="light" theme="light">
			<Stack
				screenOptions={{
					headerTransparent: true,
				}}
			>
				<Stack.Protected guard={navigationGuard.data === "unauthenticated"}>
					<Stack.Screen name="onboarding" options={{ headerShown: false }} />
					<Stack.Screen name="login" options={{ header: LoginPageHeader }} />
					<Stack.Screen name="signup" options={{ headerShown: false }} />
					<Stack.Screen
						name="forgot-password"
						options={{ header: () => <WaveHeader enableBackButton title="Password Reset" /> }}
					/>
				</Stack.Protected>

				<Stack.Protected guard={navigationGuard.data === "accountLink"}>
					<Stack.Screen name="account-link" options={{ header: () => <WaveHeader title="Account Link" /> }} />
				</Stack.Protected>

				<Stack.Protected guard={navigationGuard.data === "emailVerification"}>
					<Stack.Screen
						name="email-verification"
						options={{ header: () => <WaveHeader title="Email Verification" /> }}
					/>
				</Stack.Protected>

				<Stack.Protected guard={navigationGuard.data === "personalize"}>
					<Stack.Screen name="personalize" options={{ headerShown: false }} />
				</Stack.Protected>
			</Stack>
		</ThemeProvider>
	);
};

export default AuthLayout;
