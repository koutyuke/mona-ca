import { Text } from "@mona-ca/ui/native/components";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native";
import { useLayoutInsets, vw } from "../../layers/shared/lib";
import { ContinueWithDiscordButton, ContinueWithEmailButton, ContinueWithGoogleButton } from "../../layers/shared/ui";

const SignUpPage = () => {
	const { top, left, right, bottom } = useLayoutInsets();
	const [errorMessage, _setErrorMessage] = useState<string | null>(null);
	return (
		<ScrollView className="bg-slate-1" alwaysBounceVertical={false} showsVerticalScrollIndicator={false}>
			<View
				style={{ paddingTop: top + 44 + vw(9), paddingLeft: left, paddingRight: right, paddingBottom: bottom }}
				className="flex min-h-screen flex-1 flex-col gap-2 bg-slate-1"
			>
				<View className="flex flex-1 flex-col justify-center gap-2 py-10">
					<Text className="text-center text-slate-12">
						はじめまして
						{"\n"}
						mona-caへようこそ！
					</Text>
					<Text size="xs" className="text-center text-slate-11">
						※ アプリのご利用を持って、
						{"\n"}
						<Text size="xs" className="text-blue-9">
							利用規約
						</Text>
						に同意したものとみなされます
					</Text>
				</View>
				<View className="flex flex-col items-end gap-2">
					{errorMessage && (
						<Text size="xs" className="text-red-9 ">
							{errorMessage}
						</Text>
					)}
					<ContinueWithEmailButton fullWidth />
					<ContinueWithGoogleButton fullWidth />
					<ContinueWithDiscordButton fullWidth />
					<Link href="/(auth)/log-in" asChild>
						<Pressable className="group">
							<Text size="xs" className="text-salmon-9 transition-colors group-active:text-salmon-11">
								既にアカウントをお持ちの方はこちら
							</Text>
						</Pressable>
					</Link>
				</View>
			</View>
		</ScrollView>
	);
};

export default SignUpPage;
