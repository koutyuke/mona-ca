import { Text } from "@mona-ca/ui/native/components";
import type { JSX } from "react";
import { View } from "react-native";
import RNTurnstile from "react-native-turnstile";

type Props = {
	sitekey: string;
	onVerify: (token: string) => void;
};

export const TurnstileFormUI = ({ sitekey, onVerify }: Props): JSX.Element => {
	return (
		<View className="flex items-center justify-center gap-12 rounded-xl border border-slate-7 bg-slate-1 px-4 py-12">
			<Text className="text-center">ちょっとまって！{"\n"}あなたは人間ですか？？</Text>
			<RNTurnstile sitekey={sitekey} onVerify={onVerify} theme="light" className="mx-auto w-full overflow-hidden" />
		</View>
	);
};
