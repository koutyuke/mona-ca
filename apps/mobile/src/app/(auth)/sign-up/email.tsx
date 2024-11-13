import { Stack } from "expo-router";
import { Fragment } from "react";
import type Animated from "react-native-reanimated";
import { useAnimatedRef } from "react-native-reanimated";
import { SignUpWithEmailPageBody, SignUpWithEmailPageHeader } from "../../../pages/auth/sign-up";

const SignUpWithEmail = () => {
	const animatedBodyRef = useAnimatedRef<Animated.ScrollView>();

	return (
		<Fragment>
			<Stack.Screen
				options={{
					header: SignUpWithEmailPageHeader(animatedBodyRef),
				}}
			/>
			<SignUpWithEmailPageBody animatedBodyRef={animatedBodyRef} />
		</Fragment>
	);
};

export default SignUpWithEmail;
