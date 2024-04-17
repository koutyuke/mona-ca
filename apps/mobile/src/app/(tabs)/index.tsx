import { View } from "@/components/Themed";
import { Text } from "react-native";

export default function TabOneScreen() {
	return (
		<View className="flex-1 items-center justify-center">
			<Text className="font-bold text-2xl" style={{ color: "blue" }}>
				Tab One
			</Text>
			<Text className="text-red-500">hello world</Text>
		</View>
	);
}
