import { SignUpSelectMethodPageBody, SignUpSelectMethodPageHeader } from "@mobile/pages/auth/sign-up";
import { Stack } from "expo-router";
import { Fragment } from "react";
import type Animated from "react-native-reanimated";
import { useAnimatedRef } from "react-native-reanimated";

const SelectMethod = () => {
	const animatedBodyRef = useAnimatedRef<Animated.ScrollView>();

	return (
		<Fragment>
			<Stack.Screen
				options={{
					header: SignUpSelectMethodPageHeader(animatedBodyRef),
				}}
			/>
			<SignUpSelectMethodPageBody animatedBodyRef={animatedBodyRef} />
		</Fragment>
	);
};

export default SelectMethod;
