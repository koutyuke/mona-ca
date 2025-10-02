import { Text } from "@mona-ca/ui/native/components";
import type { JSX, ReactNode } from "react";
import { View } from "react-native";
import { useLayoutInsets } from "../../../../shared/lib/view";
import { PageTitle } from "../../../../shared/ui/page-title";
import { BODY_MIN_HEIGHT, BODY_TOP_PADDING, WAVE_HEADER_HEIGHT } from "../../../../widgets/layout";

type Props = {
	slots: {
		AgreementNotice: ReactNode;
		SignupWithEmail: ReactNode;
	};
};

export const SignupWithEmailPageUI = ({ slots: { AgreementNotice, SignupWithEmail } }: Props): JSX.Element => {
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
			<PageTitle>Signup</PageTitle>
			<View className="flex w-full flex-col gap-2">
				<Text className="text-slate-12">以下の必要項目を入力してください</Text>
				{AgreementNotice}
			</View>
			<View className="flex w-full flex-1">{SignupWithEmail}</View>
		</View>
	);
};
