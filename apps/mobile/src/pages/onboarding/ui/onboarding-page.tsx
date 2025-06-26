import { MonaCaLogo } from "@mona-ca/ui/native/brand";
import { Button, Text } from "@mona-ca/ui/native/components";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { useLayoutInsets } from "../../../shared/lib";
import { BODY_MIN_HEIGHT, Page } from "../../../widgets/layout";
import { OnboardingCardScrollView } from "./card/card-scroll-view";

export const OnboardingPage = () => {
	const { top, bottom, left, right } = useLayoutInsets();
	const router = useRouter();
	return (
		<Page indicatorStyle="black">
			<View
				className="flex min-h-full flex-col justify-between gap-8 bg-slate-1"
				style={{ paddingTop: top + 32, paddingBottom: bottom, minHeight: BODY_MIN_HEIGHT }}
			>
				<OnboardingCardScrollView />
				<View className="flex flex-col items-center gap-2">
					<MonaCaLogo className="h-10" />
					<Text size="md" weight="medium" className="text-center">
						次の予定も、今日の気持ちも。{"\n"}
						mona-caでマートに。
					</Text>
				</View>
				<View className="flex flex-col gap-2" style={{ paddingLeft: left, paddingRight: right }}>
					<Button color="salmon" variant="filled" className="w-full" onPress={() => router.push("/(auth)/sign-up")}>
						Sign up
					</Button>
					<Button color="salmon" variant="light" className="w-full" onPress={() => router.push("/(auth)/log-in")}>
						Log in
					</Button>
				</View>
			</View>
		</Page>
	);
};
