import { Stack } from "expo-router";
import { Fragment } from "react";
import type Animated from "react-native-reanimated";
import { useAnimatedRef } from "react-native-reanimated";
import { SignUpSelectMethodPageBody, SignUpSelectMethodPageHeader } from "../../../pages/auth/sign-up";

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
