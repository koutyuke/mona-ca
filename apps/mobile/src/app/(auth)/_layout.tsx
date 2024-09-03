import { CustomThemeProvider } from "@mobile/features/theme/components";
import { MonaCaLogo } from "@mona-ca/ui/native/brand";
import { Text } from "@mona-ca/ui/native/components";
import { ChevronIcon } from "@mona-ca/ui/native/icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";

const AuthLayout = () => {
	const router = useRouter();
	return (
		<CustomThemeProvider statusBarStyle="light" styleTheme="light">
			<Stack>
				<Stack.Screen
					name="index"
					options={{
						headerTransparent: true,
						headerShadowVisible: false,
						headerTitle: () => <MonaCaLogo className="h-6 fill-salmon-1" />,
					}}
				/>
				<Stack.Screen
					name="signup"
					options={{
						headerShadowVisible: false,
						headerTransparent: true,
						headerTitle: () => (
							<Text size="lg" className="text-salmon-1" bold>
								Sign up
							</Text>
						),
						headerLeft: () => (
							<Pressable
								className="group flex flex-row items-center justify-start"
								onPress={() => {
									router.navigate("/(auth)/");
								}}
							>
								<ChevronIcon className="color-salmon-1 group-active:color-salmon-4 size-8 transition-colors" />
								<Text size="md" className="text-salmon-1 transition-colors group-active:text-salmon-4">
									Back
								</Text>
							</Pressable>
						),
					}}
				/>
			</Stack>
		</CustomThemeProvider>
	);
};

export default AuthLayout;
