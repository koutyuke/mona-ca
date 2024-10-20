import { useLayoutInsets } from "@mobile/shared/hooks";
import { PageWaveTitle, ScrollBody } from "@mobile/widgets/layout";
import { Button, CheckBox, GenderSelector, Heading, Text, TextInput } from "@mona-ca/ui/native/components";
import { EmailIcon, PasswordIcon, UserIcon } from "@mona-ca/ui/native/icons";
import type { FC } from "react";
import { View } from "react-native";
import { pageTitle } from "./page-title";

type SignUpWithEmailPageBodyProps = {
	animatedBodyRef: Parameters<typeof PageWaveTitle>[0]["animatedBodyRef"];
};

const SignUpWithEmailPageBody: FC<SignUpWithEmailPageBodyProps> = ({ animatedBodyRef }) => {
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
			<PageWaveTitle animatedBodyRef={animatedBodyRef} title={pageTitle} />
			<View
				className="w-full"
				style={{
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
			>
				<Text className="text-slate-11">
					メールアドレスでアカウントを作成します。{"\n"}以下の項目を記入し、ご登録ください。
				</Text>
			</View>
			<View
				className="flex w-full flex-col gap-3"
				style={{
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
			>
				<Heading level="2">Email Address</Heading>
				<View>
					<Text className="text-slate-11">アカウントに登録するメールアドレスを入力してください。</Text>
				</View>
				<View className="gap-2">
					<TextInput label="Email Address" placeholder="email@example.com" icon={EmailIcon} />
					<TextInput label="Re - Email Address" placeholder="email@example.com" icon={EmailIcon} />
					<Text size="sm" className="text-slate-11">
						このメールアドレスはパスワードリセットの時に必要になります。
					</Text>
				</View>
			</View>
			<View
				className="flex w-full flex-col gap-3"
				style={{
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
			>
				<Heading level="2">User Name</Heading>
				<View>
					<Text className="text-slate-11">あなたの素敵なお名前を教えてください!</Text>
				</View>
				<View className="gap-2">
					<TextInput label="User Name" placeholder="モナカ" icon={UserIcon} />
					<Text size="sm" className="text-slate-11">
						2文字以上、32文字以下で入力してください。
					</Text>
				</View>
			</View>
			<View
				className="flex w-full flex-col gap-3"
				style={{
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
			>
				<Heading level="2">Password</Heading>
				<View>
					<Text className="text-slate-11">設定するパスワードを入力してください。</Text>
				</View>
				<View className="gap-2">
					<TextInput label="Password" placeholder="Password" credentials icon={PasswordIcon} />
					<TextInput label="Re - Password" placeholder="Password" credentials icon={PasswordIcon} />
					<Text size="sm" className="text-slate-11">
						8文字以上64文字以下で入力してください。
					</Text>
				</View>
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
				<Button color="salmon" variant="filled" bodyClassName="bg-mona-ca active:bg-mona-ca/80" fullWidth bold>
					Create New Account
				</Button>
			</View>
		</ScrollBody>
	);
};

export { SignUpWithEmailPageBody };
