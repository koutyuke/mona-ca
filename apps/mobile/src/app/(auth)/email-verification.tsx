import { useAtom, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { Pressable, Text, View } from "react-native";
import { sessionTokenAtom } from "../../entities/session";
import { userAtom } from "../../entities/user";
import { visitableSetupPageAtom } from "../../features/navigation-guard";

const EmailVerificationPage = () => {
	const setSessionToken = useSetAtom(sessionTokenAtom);
	const [user, setUser] = useAtom(userAtom);
	const setVisitableSetupPage = useSetAtom(visitableSetupPageAtom);

	return (
		<View className="flex h-screen w-screen flex-1 items-center justify-center">
			<Text>Email Verification</Text>
			<Pressable
				onPress={() => {
					setSessionToken(null);
					setUser(RESET);
				}}
			>
				<Text>Log Out</Text>
			</Pressable>
			<Pressable
				onPress={() => {
					setUser({ type: "update", payload: { ...user.data!, emailVerified: true } });
					setVisitableSetupPage("personalize");
				}}
			>
				<Text>Personalize</Text>
			</Pressable>
		</View>
	);
};

export default EmailVerificationPage;
