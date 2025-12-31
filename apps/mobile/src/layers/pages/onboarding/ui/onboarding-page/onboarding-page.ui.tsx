import { MonaCaLogo } from "@mona-ca/ui/native/brand";
import { Button, Text } from "@mona-ca/ui/native/components";
import { Link } from "expo-router";
import { View } from "react-native";
import { useLayoutInsets } from "../../../../shared/lib/view";
import { BODY_MIN_HEIGHT, BODY_TOP_PADDING } from "../../../../widgets/layout";
import { FeatureCarouselUI } from "../feature-carousel/feature-carousel.ui";

export const OnboardingPageUI = () => {
	const { top, bottom, left, right } = useLayoutInsets();

	return (
		<View
			className="flex min-h-full flex-col justify-between gap-8 bg-slate-1"
			style={{ paddingTop: top + BODY_TOP_PADDING, paddingBottom: bottom, minHeight: BODY_MIN_HEIGHT }}
		>
			<FeatureCarouselUI />
			<View className="flex flex-col items-center gap-2">
				<MonaCaLogo className="h-10" />
				<Text className="text-center" size="md" weight="medium">
					次の予定も、今日の気持ちも。{"\n"}
					mona-caでマートに。
				</Text>
			</View>
			<View className="flex flex-col gap-2" style={{ paddingLeft: left, paddingRight: right }}>
				<Link asChild href="/(auth)/signup">
					<Button className="w-full" color="salmon" variant="filled">
						新規登録
					</Button>
				</Link>
				<Link asChild href="/(auth)/login">
					<Button className="w-full" color="salmon" variant="light">
						ログイン
					</Button>
				</Link>
			</View>
		</View>
	);
};
