import { Text } from "@mona-ca/ui/native/components";
import { Link } from "expo-router";
import type { JSX, ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useLayoutInsets } from "../../../../shared/lib/view";
import { PageTitle } from "../../../../shared/ui/page-title";
import { BODY_MIN_HEIGHT, BODY_TOP_PADDING, WAVE_HEADER_HEIGHT } from "../../../../widgets/layout";

type Props = {
	slots: {
		AgreementNotice: ReactNode;
		LastLoginMethod: ReactNode;
		LoginWithEmail: ReactNode;
		LoginWithSocial: ReactNode;
	};
};

export const LoginPageUI = ({
	slots: { AgreementNotice, LastLoginMethod, LoginWithEmail, LoginWithSocial },
}: Props): JSX.Element => {
	const { top, left, right, bottom } = useLayoutInsets();
	return (
		<View
			style={{
				paddingTop: top + WAVE_HEADER_HEIGHT + BODY_TOP_PADDING,
				paddingLeft: left,
				paddingRight: right,
				paddingBottom: bottom,
				minHeight: BODY_MIN_HEIGHT,
			}}
			className="flex flex-1 flex-col gap-6 bg-slate-1"
		>
			<PageTitle>Login</PageTitle>
			<View className="flex w-full flex-1 flex-col gap-2">
				<Text className="text-slate-12">お帰りなさい、 また会えましたね!</Text>
				{AgreementNotice}
			</View>
			<View className="flex w-full flex-col gap-2">
				<View className="flex w-full flex-col items-end">{LastLoginMethod}</View>
				{LoginWithEmail}
				<View className="flex h-8 w-full flex-row items-center gap-4">
					<View className="h-0.5 flex-1 rounded-full bg-slate-7" />
					<Text size="sm" className="text-slate-9 leading-[18px]" weight="medium">
						または
					</Text>
					<View className="h-0.5 flex-1 rounded-full bg-slate-7" />
				</View>
				{LoginWithSocial}
				<Link href="/(auth)/signup" asChild>
					<Pressable className="group mt-1 self-end">
						<Text size="sm" className="text-salmon-9 transition-colors group-active:text-salmon-11">
							アカウントの新規登録はこちら
						</Text>
					</Pressable>
				</Link>
			</View>
		</View>
	);
};
