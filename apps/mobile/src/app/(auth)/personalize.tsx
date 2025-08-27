import { useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { Pressable, Text, View } from "react-native";
import { sessionTokenAtom } from "../../entities/session";
import { userAtom } from "../../entities/user";
import { visitableSetupPageAtom } from "../../features/navigation-guard";

const PersonalizePage = () => {
	const setSessionToken = useSetAtom(sessionTokenAtom);
	const setUser = useSetAtom(userAtom);
	const setVisitableSetupPage = useSetAtom(visitableSetupPageAtom);

	return (
		<View className="flex flex-1 items-center justify-center">
			<Text>Personalize</Text>
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
					setVisitableSetupPage(false);
				}}
			>
				<Text>Go Home</Text>
			</Pressable>
		</View>
	);
};

export default PersonalizePage;
