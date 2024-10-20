import { LogInPageBody, LogInPageHeader } from "@mobile/pages/auth/log-in";
import { Stack } from "expo-router";
import { Fragment } from "react";
import type Animated from "react-native-reanimated";
import { useAnimatedRef } from "react-native-reanimated";

const LogIn = () => {
	const animatedBodyRef = useAnimatedRef<Animated.ScrollView>();

	return (
		<Fragment>
			<Stack.Screen
				options={{
					header: LogInPageHeader(animatedBodyRef),
				}}
			/>
			<LogInPageBody animatedBodyRef={animatedBodyRef} />
		</Fragment>
	);
};

export default LogIn;
