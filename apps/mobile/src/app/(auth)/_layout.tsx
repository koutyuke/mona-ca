import { Stack } from "expo-router";
import { ThemeProvider } from "../../layers/app/providers";
import { useNavigationGuard } from "../../layers/features/navigation-guard";
import { LoginPageHeader } from "../../layers/pages/login";
import { WaveHeader } from "../../layers/widgets/layout";

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
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen name="login" options={{ header: LoginPageHeader }} />
					<Stack.Screen
						name="signup"
						options={{
							header: () => <WaveHeader title="Sign Up" enableBackButton />,
						}}
					/>
					<Stack.Screen
						name="forgot-password"
						options={{ header: () => <WaveHeader title="Password Reset" enableBackButton /> }}
					/>
				</Stack.Protected>

				<Stack.Protected guard={navigationGuard.data === "accountAssociation"}>
					<Stack.Screen
						name="account-association"
						options={{ header: () => <WaveHeader title="Account Association" /> }}
					/>
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

				<Stack.Protected guard={navigationGuard.data === "ready"}>
					<Stack.Screen name="ready" options={{ headerShown: false }} />
				</Stack.Protected>
			</Stack>
		</ThemeProvider>
	);
};

export default AuthLayout;
