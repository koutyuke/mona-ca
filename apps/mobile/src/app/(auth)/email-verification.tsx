import { useAtom, useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { Pressable, Text, View } from "react-native";
import { sessionTokenAtom } from "../../layers/entities/session";
import { userAtom } from "../../layers/entities/user";

const EmailVerificationPage = () => {
	const setSessionToken = useSetAtom(sessionTokenAtom);
	const [user, setUser] = useAtom(userAtom);

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
				}}
			>
				<Text>Personalize</Text>
			</Pressable>
		</View>
	);
};

export default EmailVerificationPage;
