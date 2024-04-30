import { useState } from "react";
import { Button, Text, View } from "react-native";

export default function TabTwoScreen() {
	const [count, setCount] = useState(0);
	return (
		<View className="flex h-full w-full items-center justify-center gap-2">
			<Text className="text-2xl text-pure">Count: {count}</Text>
			<Button onPress={() => setCount(prev => prev + 1)} title="Increment" />
		</View>
	);
}
