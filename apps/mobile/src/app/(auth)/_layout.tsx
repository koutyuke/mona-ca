import { Stack } from "expo-router";
import { useNavigationGuard } from "../../features/navigation-guard";
import { ThemeProvider } from "../../layers/app/providers";
import { LoginPageHeader } from "../../pages/log-in";
import { WaveHeader } from "../../widgets/layout";

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
					<Stack.Screen name="log-in" options={{ header: LoginPageHeader }} />
					<Stack.Screen
						name="sign-up"
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
