import { Button, CheckBox, GenderSelector, Heading, Text } from "@mona-ca/ui/native/components";
import type { FC } from "react";
import { View } from "react-native";
import { type OAuthProvider, ProviderButton, capitalizeProvider } from "../../../../../features/auth";
import { useLayoutInsets } from "../../../../../shared/hooks";
import { PageWaveTitle, ScrollBody } from "../../../../../widgets/layout";
import { pageTitle } from "./page-title";

type SignUpWithProviderPageBodyProps = {
	animatedBodyRef: Parameters<typeof PageWaveTitle>[0]["animatedBodyRef"];
	provider: OAuthProvider;
};

const SignUpWithProviderPageBody: FC<SignUpWithProviderPageBodyProps> = ({ animatedBodyRef, provider }) => {
	const insets = useLayoutInsets();
	return (
		<ScrollBody
			ref={animatedBodyRef}
			indicatorStyle="black"
			innerViewClassName="flex min-h-full w-full flex-col gap-6"
			innerViewStyle={{
				paddingBottom: insets.bottom,
			}}
			keyboardAwareScrollViewClassName="h-full w-full bg-slate-1"
		>
			<PageWaveTitle animatedBodyRef={animatedBodyRef} title={pageTitle(provider)} />
			<View
				className="w-full"
				style={{
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
			>
				<Text className="text-slate-11">
					{capitalizeProvider(provider)}アカウントでmona-caのアカウントを作成します。{"\n"}
					以下の項目を記入し、ご登録ください。
				</Text>
			</View>
			<View
				className="flex w-full flex-col gap-3"
				style={{
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
			>
				<Heading level="2">Gender</Heading>
				<View>
					<Text className="text-slate-11">あなたの性別を教えてください。</Text>
				</View>
				<View className="gap-2">
					<GenderSelector />
				</View>
			</View>
			<View
				className="flex w-full flex-col gap-3"
				style={{
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
			>
				<Heading level="2">Privacy Policy</Heading>
				<View>
					<Text className="text-slate-11">
						mona-caをご利用になるには以下の利用規約・プライバシーポリシーに同意していただく必要があります。
					</Text>
				</View>
				<View className="gap-2">
					<Button color="blue" variant="outline" fullWidth>
						利用規約・プライバシーポリシー
					</Button>
					<CheckBox size="md" label="利用規約に同意する" className="self-end" />
				</View>
			</View>
			<View
				className="flex w-full flex-col gap-3"
				style={{
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
			>
				<Text size="sm" className="text-slate-11">
					{"\u203B"} ポップアップが表示されますが、「続ける」を選択してください。
				</Text>
				<ProviderButton provider={provider} fullWidth />
			</View>
		</ScrollBody>
	);
};

export { SignUpWithProviderPageBody };
