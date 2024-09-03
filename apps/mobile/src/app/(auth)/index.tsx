import { MonaCaIcon } from "@mona-ca/ui/native/brand";
import { Button, Heading, Text } from "@mona-ca/ui/native/components";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

cssInterop(SafeAreaView, {
	className: {
		target: "style",
	},
});

const Root = () => {
	const router = useRouter();
	return (
		<SafeAreaView className="flex h-full w-full flex-col items-center justify-center gap-8 bg-mona-ca px-4">
			<View className="flex h-[40%] w-full items-center justify-end overflow-hidden">
				<MonaCaIcon className="aspect-square w-2/3" />
			</View>
			<View className="flex w-full flex-1 flex-col gap-2">
				<Heading level="2" bold className="text-salmon-1">
					Welcome to{"\n"}mona-ca!
				</Heading>
				<Text className="text-salmon-1" size="md" bold>
					こんにちは!{"\n"}ようこそ、mona-caへ!
				</Text>
			</View>
			<View className="flex w-full flex-col gap-2">
				<Button color="white" variant="filled" size="md" bold textOverrideClassName="text-mona-ca" fullWidth>
					Log in
				</Button>
				<Button
					color="white"
					variant="outline"
					size="md"
					bold
					fullWidth
					onPress={() => {
						router.push("/(auth)/signup");
					}}
				>
					Sign up
				</Button>
			</View>
		</SafeAreaView>
	);
};

export default Root;
