import { MonaCaIcon } from "@mona-ca/ui/native/brand";
import { Button, Heading, Text } from "@mona-ca/ui/native/components";
import { Link } from "expo-router";
import type { FC } from "react";
import { View } from "react-native";
import type { AnimatedRef } from "react-native-reanimated";
import type Animated from "react-native-reanimated";
import { useLayoutInsets } from "../../../../shared/hooks";
import { Body } from "../../../../widgets/layout";

type WelcomePageBodyProps = {
	animatedBodyRef: AnimatedRef<Animated.ScrollView>;
};

const WelcomePageBody: FC<WelcomePageBodyProps> = ({ animatedBodyRef }) => {
	const insets = useLayoutInsets();

	return (
		<Body
			className="flex h-full w-full flex-col gap-8 bg-mona-ca"
			style={{
				paddingTop: insets.topWithHeader,
				paddingLeft: insets.left,
				paddingRight: insets.right,
				paddingBottom: insets.bottom,
			}}
			ref={animatedBodyRef}
		>
			<View className="flex h-[40%] w-full items-center justify-end overflow-hidden">
				<MonaCaIcon className="aspect-square w-2/3" />
			</View>
			<View className="flex w-full flex-1 flex-col gap-2">
				<Heading level="1" bold className="text-salmon-1">
					Welcome to{"\n"}mona-ca!
				</Heading>
				<Text className="text-salmon-1" size="lg" bold>
					こんにちは!{"\n"}ようこそ、mona-caへ!
				</Text>
			</View>
			<View className="flex w-full flex-col gap-2">
				<Link href="/(auth)/log-in" asChild>
					<Button color="white" variant="filled" size="md" bold textClassName="text-mona-ca" fullWidth>
						Log in
					</Button>
				</Link>
				<Link href="/(auth)/sign-up/" asChild>
					<Button color="white" variant="outline" size="md" bold fullWidth>
						Sign up
					</Button>
				</Link>
			</View>
		</Body>
	);
};

export { WelcomePageBody };
