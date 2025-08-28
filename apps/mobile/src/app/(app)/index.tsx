import { Pressable, Text, View } from "react-native";
import { publishAuthReset } from "../../layers/shared/auth";

const Index = () => {
	return (
		<View className="flex h-screen w-screen flex-1 items-center justify-center bg-red-9">
			<Text>Hello</Text>
			<Pressable
				onPress={() => {
					publishAuthReset("logout");
				}}
			>
				<Text>Log Out</Text>
			</Pressable>
		</View>
	);
};

export default Index;
