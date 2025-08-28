import { Text } from "@mona-ca/ui/native/components";
import { Link } from "expo-router";
import type { JSX } from "react";
import { Pressable, View } from "react-native";
import { LastLoginMethod } from "../../../entities/session";
import { LoginWithEmail, LoginWithSocial } from "../../../features/auth";
import { useLayoutInsets } from "../../../shared/lib";
import { BODY_MIN_HEIGHT, Page, WAVE_HEADER_HEIGHT } from "../../../widgets/layout";

export const LoginPage = (): JSX.Element => {
	const { top, left, right, bottom } = useLayoutInsets();

	return (
		<Page indicatorStyle="black">
			<View
				style={{
					paddingTop: top + WAVE_HEADER_HEIGHT,
					paddingLeft: left,
					paddingRight: right,
					paddingBottom: bottom,
					minHeight: BODY_MIN_HEIGHT,
				}}
				className="flex flex-1 flex-col gap-2 bg-slate-1"
			>
				<View className="flex w-full flex-1 flex-col justify-center gap-2 py-10">
					<Text className="text-center text-slate-12">
						お帰りなさい{"\n"}
						また会えましたね!
					</Text>
					<Text size="xs" className="text-center text-slate-11">
						※ アプリのご利用を持って、{"\n"}
						<Text size="xs" className="text-blue-9">
							利用規約
						</Text>
						に同意したものとみなされます
					</Text>
				</View>
				<LastLoginMethod />
				<LoginWithEmail />
				<View className="flex h-8 w-full flex-row items-center gap-4">
					<View className="h-0.5 flex-1 rounded-full bg-slate-7" />
					<Text size="xs" className="text-slate-9 leading-[18px]" weight="medium">
						Or
					</Text>
					<View className="h-0.5 flex-1 rounded-full bg-slate-7" />
				</View>
				<LoginWithSocial />
				<Link href="/(auth)/sign-up" asChild>
					<Pressable className="group self-end">
						<Text size="xs" className="text-salmon-9 transition-colors group-active:text-salmon-11">
							アカウントの新規登録はこちら
						</Text>
					</Pressable>
				</Link>
			</View>
		</Page>
	);
};
