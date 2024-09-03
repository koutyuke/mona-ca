import { cssInterop } from "nativewind";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

cssInterop(SafeAreaView, {
	className: {
		target: "style",
	},
});

const Root = () => {
	return (
		<View className="flex h-full w-full flex-col items-center justify-center gap-8 bg-mona-ca px-4">
			<Text className="font-bold text-2xl text-white">Welcome to MonaCa</Text>
		</View>
	);
};

export default Root;
