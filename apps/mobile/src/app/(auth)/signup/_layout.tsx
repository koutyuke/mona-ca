import { Stack } from "expo-router";
import { SignupPageHeader, SignupWithEmailPageHeader } from "../../../layers/pages/signup";

const SignupLayout = () => {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ header: SignupPageHeader, headerTransparent: true }} />
			<Stack.Screen name="email" options={{ header: SignupWithEmailPageHeader, headerTransparent: true }} />
		</Stack>
	);
};

export default SignupLayout;
