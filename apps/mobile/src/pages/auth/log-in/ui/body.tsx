import { Button, Text, TextInput } from "@mona-ca/ui/native/components";
import { EmailIcon, PasswordIcon } from "@mona-ca/ui/native/icons";
import { DiscordButton, GoogleButton } from "@mona-ca/ui/native/social";
import { Link } from "expo-router";
import type { FC } from "react";
import { View } from "react-native";
import { useLayoutInsets } from "../../../../shared/hooks";
import { PageWaveTitle, ScrollBody } from "../../../../widgets/layout";
import { pageTitle } from "./page-title";

type LogInPageBodyProps = {
	animatedBodyRef: Parameters<typeof PageWaveTitle>[0]["animatedBodyRef"];
};

const LogInPageBody: FC<LogInPageBodyProps> = ({ animatedBodyRef }) => {
	const insets = useLayoutInsets();

	return (
		<ScrollBody
			innerViewClassName="flex min-h-screen w-full flex-col gap-6"
			innerViewStyle={{
				paddingBottom: insets.bottom,
			}}
			keyboardAwareScrollViewClassName="min-h-screen w-full bg-slate-1"
			ref={animatedBodyRef}
		>
			<PageWaveTitle animatedBodyRef={animatedBodyRef} title={pageTitle} />
			<View
				className="w-full flex-1"
				style={{
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
			>
				<Text className="text-slate-11">
					お帰りなさい。また会えましたね!{"\n"}
					ログイン方法をご選択ください。
				</Text>
			</View>
			<View
				className="flex flex-col justify-end gap-2"
				style={{
					paddingLeft: insets.left,
					paddingRight: insets.right,
				}}
			>
				<View className="gap-2">
					<TextInput label="Email Address" placeholder="email@example.com" icon={EmailIcon} />
					<TextInput label="Password" placeholder="Password" credentials icon={PasswordIcon} />
					<Link href="/(auth)" asChild>
						<Button variant="ghost" color="salmon" bold size="sm" bodyClassName="self-end">
							パスワードをお忘れですか？
						</Button>
					</Link>
					<Button color="salmon" variant="filled" bodyClassName="bg-mona-ca active:bg-mona-ca/80" fullWidth bold>
						Log In
					</Button>
				</View>
				<View className="flex flex-row items-center justify-center gap-2 px-2">
					<View className="h-0.5 flex-1 rounded-full bg-slate-8" />
					<Text className="text-slate-8" size="sm">
						or
					</Text>
					<View className="h-0.5 flex-1 rounded-full bg-slate-8" />
				</View>
				<View className="gap-2">
					<GoogleButton fullWidth />
					<DiscordButton fullWidth />
					<Link href="/(auth)/sign-up" replace asChild>
						<Button variant="ghost" color="salmon" bold size="sm" bodyClassName="self-end">
							アカウントの新規登録はこちら
						</Button>
					</Link>
				</View>
			</View>
		</ScrollBody>
	);
};

export { LogInPageBody };
