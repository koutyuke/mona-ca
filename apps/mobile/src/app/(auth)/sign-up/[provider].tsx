import { Redirect, useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import { Fragment } from "react";
import type Animated from "react-native-reanimated";
import { useAnimatedRef } from "react-native-reanimated";
import { checkProvider } from "../../../features/auth";
import { SignUpWithProviderPageBody, SignUpWithProviderPageHeader } from "../../../pages/auth/sign-up";

const SignUpWithProvider = () => {
	const animatedBodyRef = useAnimatedRef<Animated.ScrollView>();
	const { provider } = useLocalSearchParams<{ provider: string }>();

	if (!checkProvider(provider)) {
		return <Redirect href="/(auth)/sign-up" />;
	}

	return (
		<Fragment>
			<Stack.Screen
				options={{
					header: SignUpWithProviderPageHeader(animatedBodyRef, provider),
				}}
			/>
			<SignUpWithProviderPageBody animatedBodyRef={animatedBodyRef} provider={provider} />
		</Fragment>
	);
};

export default SignUpWithProvider;
