import { Text } from "@mona-ca/ui/native/components";
import { Link } from "expo-router";
import type { JSX, ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useLayoutInsets } from "../../../../shared/lib/view";
import { ContinueWithEmailButton } from "../../../../shared/ui/continue-with-method-button";
import { PageTitle } from "../../../../shared/ui/page-title";
import { BODY_MIN_HEIGHT, BODY_TOP_PADDING, WAVE_HEADER_HEIGHT } from "../../../../widgets/layout";

type Props = {
	slots: {
		AgreementNotice: ReactNode;
		SignupWithSocial: ReactNode;
	};
};

export const SignupPageUI = ({ slots: { AgreementNotice, SignupWithSocial } }: Props): JSX.Element => {
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
			className="flex flex-1 flex-col gap-6"
		>
			<PageTitle>Signup</PageTitle>
			<View className="flex w-full flex-1 flex-col gap-2">
				<Text className="text-slate-12">はじめまして、mona-caへようこそ！</Text>
				{AgreementNotice}
			</View>
			<View className="flex flex-col items-end gap-2">
				{SignupWithSocial}
				<Link href="/(auth)/signup/email" asChild>
					<ContinueWithEmailButton fullWidth />
				</Link>
				<Link href="/(auth)/login" asChild>
					<Pressable className="group mt-1 self-end">
						<Text size="sm" className="text-salmon-9 transition-colors group-active:text-salmon-11">
							既にアカウントをお持ちの方はこちら
						</Text>
					</Pressable>
				</Link>
			</View>
		</View>
	);
};
