import { useSetAtom } from "jotai";
import { RESET } from "jotai/utils";
import { Pressable, Text, View } from "react-native";
import { sessionTokenAtom } from "../../layers/entities/session";
import { userAtom } from "../../layers/entities/user";
import { visitPersonalizePageFlagAtom } from "../../layers/features/auth";

const PersonalizePage = () => {
	const setSessionToken = useSetAtom(sessionTokenAtom);
	const setUser = useSetAtom(userAtom);
	const setVisitPersonalizePageFlag = useSetAtom(visitPersonalizePageFlagAtom);

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
					setVisitPersonalizePageFlag(false);
				}}
			>
				<Text>Go Home</Text>
			</Pressable>
		</View>
	);
};

export default PersonalizePage;
