import { useSetAtom } from "jotai";
import { Pressable, Text, View } from "react-native";
import { accountAssociationSessionTokenAtom } from "../../layers/entities/session";

const AccountAssociationPage = () => {
	const setAccountAssociationToken = useSetAtom(accountAssociationSessionTokenAtom);
	return (
		<View className="flex flex-1 items-center justify-center">
			<Text>Account Association</Text>
			<Pressable
				onPress={() => {
					setAccountAssociationToken(null);
				}}
			>
				<Text>Log Out</Text>
			</Pressable>
		</View>
	);
};

export default AccountAssociationPage;
