import { WelcomePageBody, WelcomePageHeader } from "@mobile/pages/auth/welcome";
import { Stack } from "expo-router";
import { Fragment } from "react";
import type Animated from "react-native-reanimated";
import { useAnimatedRef } from "react-native-reanimated";

const Welcome = () => {
	const animatedBodyRef = useAnimatedRef<Animated.ScrollView>();

	return (
		<Fragment>
			<Stack.Screen
				options={{
					header: WelcomePageHeader(animatedBodyRef),
				}}
			/>
			<WelcomePageBody animatedBodyRef={animatedBodyRef} />
		</Fragment>
	);
};

export default Welcome;
