import { useTheme } from "@/features/theme/hooks";
import { Text, TouchableOpacity, View } from "react-native";

export default function TabOneScreen() {
	const [, setColorScheme] = useTheme();
	return (
		<View className="flex h-full w-full items-center justify-center gap-4">
			<View className="flex flex-row gap-4">
				<TouchableOpacity
					className="m-auto flex min-h-12 min-w-20 items-center justify-center rounded-lg border border-green-7 bg-green-3 px-4 py-2"
					onPress={() => {
						setColorScheme(config => ({ ...config, colorScheme: "dark" }));
					}}
				>
					<Text className="text-green-11 text-xl">Dark</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className="m-auto flex min-h-12 min-w-20 items-center justify-center rounded-lg border border-green-7 bg-green-3 px-4 py-2"
					onPress={() => {
						setColorScheme(config => ({ ...config, colorScheme: "light" }));
					}}
				>
					<Text className="text-green-11 text-xl">Light</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className="m-auto flex min-h-12 min-w-20 items-center justify-center rounded-lg border border-green-7 bg-green-3 px-4 py-2"
					onPress={() => {
						setColorScheme(config => ({ ...config, colorScheme: "system" }));
					}}
				>
					<Text className="text-green-11 text-xl">System</Text>
				</TouchableOpacity>
			</View>
			<View className="flex flex-row">
				<View className="h-16 w-16 bg-pure" />
				<View className="h-16 w-16 bg-orange-9" />
				<View className="h-16 w-16 bg-iris-9" />
			</View>
		</View>
	);
}
