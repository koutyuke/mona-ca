import { Button, Text } from "@mona-ca/ui/native/components";
import { EmailIcon } from "@mona-ca/ui/native/icons";
import { DiscordButton, GoogleButton } from "@mona-ca/ui/native/social";
import { Link } from "expo-router";
import type { FC } from "react";
import { View } from "react-native";
import { useLayoutInsets } from "../../../../../shared/hooks";
import { Body, PageWaveTitle } from "../../../../../widgets/layout";
import { pageTitle } from "./page-title";

type SignUpSelectMethodPageBodyProps = {
	animatedBodyRef: Parameters<typeof PageWaveTitle>[0]["animatedBodyRef"];
};

const SignUpSelectMethodPageBody: FC<SignUpSelectMethodPageBodyProps> = ({ animatedBodyRef }) => {
	const insets = useLayoutInsets();

	return (
		<Body className="flex h-full w-full flex-col gap-6 bg-slate-1" ref={animatedBodyRef}>
			<PageWaveTitle animatedBodyRef={animatedBodyRef} title={pageTitle} />
			<View
				className="flex w-full flex-1 flex-col gap-2"
				style={{
					paddingLeft: insets.left,
					paddingRight: insets.right,
					paddingBottom: insets.bottom,
				}}
			>
				<View className="flex-1">
					<Text className="text-slate-11">初めまして！</Text>
					<Text className="text-slate-11">mona-caをご利用になるにはアカウントが必要になります。</Text>
					<Text className="text-slate-11">アカウント作成方法をご選択ください。</Text>
				</View>
				<View className="gap-2">
					<Link href="/(auth)/sign-up/email" asChild>
						<Button color="gray" leftIcon={EmailIcon} fullWidth bold>
							メールアドレスで続ける
						</Button>
					</Link>
					<Link href="/(auth)/sign-up/google" asChild>
						<GoogleButton fullWidth />
					</Link>
					<Link href="/(auth)/sign-up/discord" asChild>
						<DiscordButton fullWidth />
					</Link>
				</View>
				<View className="flex flex-row-reverse">
					<Link href="/(auth)/log-in/" replace asChild>
						<Button variant="ghost" color="salmon" bold size="sm">
							既にアカウントをお持ちの方はこちら
						</Button>
					</Link>
				</View>
			</View>
		</Body>
	);
};

export { SignUpSelectMethodPageBody };
