import { useSetAtom } from "jotai";
import { Pressable, Text, View } from "react-native";
import { accountLinkTokenAtom } from "../../layers/entities/session";

const AccountLinkPage = () => {
	const setAccountLinkToken = useSetAtom(accountLinkTokenAtom);
	return (
		<View className="flex flex-1 items-center justify-center">
			<Text>Account Link</Text>
			<Pressable
				onPress={() => {
					setAccountLinkToken(null);
				}}
			>
				<Text>Log Out</Text>
			</Pressable>
		</View>
	);
};

export default AccountLinkPage;
