import { useSetAtom } from "jotai";
import { Pressable, Text, View } from "react-native";
import { visitPersonalizePageFlagAtom } from "../../layers/features/auth";
import { publishAuthReset } from "../../layers/shared/lib/auth";

const PersonalizePage = () => {
	const setVisitPersonalizePageFlag = useSetAtom(visitPersonalizePageFlagAtom);

	return (
		<View className="flex flex-1 items-center justify-center">
			<Text>Personalize</Text>
			<Pressable
				onPress={() => {
					publishAuthReset("logout");
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
