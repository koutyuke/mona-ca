import { valibotResolver } from "@hookform/resolvers/valibot";
import { isErr } from "@mona-ca/core/utils";
import { Button, InputWrapper, Text, TextInput } from "@mona-ca/ui/native/components";
import { EmailIcon, PasswordIcon } from "@mona-ca/ui/native/icons";
import { Link } from "expo-router";
import { useAtom } from "jotai";
import { type JSX, useRef, useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { ReactNativeModal as Modal } from "react-native-modal";
import RNTurnstile from "react-native-turnstile";
import { lastLoginMethodAtom, sessionTokenAtom } from "../../../../entities/session";
import { useLayoutInsets } from "../../../../shared/lib";
import { ContinueWithDiscordButton, ContinueWithGoogleButton } from "../../../../shared/ui";
import { BODY_MIN_HEIGHT, Page, WAVE_HEADER_HEIGHT } from "../../../../widgets/layout";
import { logIn } from "../../api/log-in";
import { type FormSchema, formSchema } from "./form-schema";

export const LogInPage = (): JSX.Element => {
	const turnstileResetRef = useRef<() => void>(() => {});
	const { top, left, right, bottom } = useLayoutInsets();

	const [lastLoginMethod, setLastLoginMethod] = useAtom(lastLoginMethodAtom);
	const [_, setSessionToken] = useAtom(sessionTokenAtom);

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isLoading, setIsLoading] = useState<false | "email" | "google" | "discord">(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isModalClosable, setIsModalClosable] = useState<boolean>(true);

	const { control, handleSubmit } = useForm({
		resolver: valibotResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		mode: "onChange",
	});

	const onSubmit: (turnstileToken: string) => SubmitHandler<FormSchema> = turnstileToken => async data => {
		const result = await logIn(data.email, data.password, turnstileToken);
		setIsLoading(false);
		if (isErr(result)) {
			setErrorMessage(result.value.errorMessage);
			setIsLoading(false);
			return;
		}
		setLastLoginMethod("email");
		setErrorMessage(null);
		setSessionToken(result.sessionToken);
		setIsLoading(false);
	};

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
				<View className="flex flex-1 flex-col justify-center gap-2 py-10">
					<Text className="text-center text-slate-12">
						お帰りなさい
						{"\n"}
						また会えましたね!
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
					{lastLoginMethod && (
						<Text size="xs" className="text-slate-11">
							前回のログイン方法：{lastLoginMethod}
						</Text>
					)}
					<View className="flex w-full flex-col items-end gap-2">
						<Controller
							name="email"
							control={control}
							render={({ field: { onBlur, onChange, value, ref }, fieldState: { error } }) => (
								<InputWrapper label="メールアドレス" error={error?.message ?? ""}>
									<TextInput
										ref={ref}
										placeholder="Email"
										icon={EmailIcon}
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
									/>
								</InputWrapper>
							)}
						/>
						<Controller
							name="password"
							control={control}
							render={({ field: { onBlur, onChange, value, ref }, fieldState: { error } }) => (
								<InputWrapper label="パスワード" error={error?.message ?? ""}>
									<TextInput
										ref={ref}
										placeholder="Password"
										icon={PasswordIcon}
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										credentials
									/>
								</InputWrapper>
							)}
						/>
						<Link href="/(auth)/onboarding" asChild>
							<Pressable className="group">
								<Text size="xs" className="text-salmon-9 transition-colors group-active:text-salmon-11">
									パスワードをお忘れですか？
								</Text>
							</Pressable>
						</Link>
						<Button
							className="w-full"
							variant="filled"
							color="salmon"
							onPress={() => {
								setIsModalVisible(true);
								setIsLoading("email");
							}}
							loading={isLoading === "email"}
							disabled={isLoading && isLoading !== "email"}
						>
							Log In
						</Button>
					</View>
					<View className="flex h-8 w-full flex-row items-center gap-4">
						<View className="h-0.5 flex-1 rounded-full bg-slate-7" />
						<Text size="xs" className="text-slate-9 leading-[18px]" weight="medium">
							Or
						</Text>
						<View className="h-0.5 flex-1 rounded-full bg-slate-7" />
					</View>
					<ContinueWithGoogleButton
						fullWidth
						loading={isLoading === "google"}
						disabled={isLoading && isLoading !== "google"}
					/>
					<ContinueWithDiscordButton
						fullWidth
						loading={isLoading === "discord"}
						disabled={isLoading && isLoading !== "discord"}
					/>
					<Link href="/(auth)/sign-up" asChild>
						<Pressable className="group">
							<Text size="xs" className="text-salmon-9 transition-colors group-active:text-salmon-11">
								アカウントの新規登録はこちら
							</Text>
						</Pressable>
					</Link>
				</View>
			</View>
			<Modal
				isVisible={isModalVisible}
				hideModalContentWhileAnimating={true}
				useNativeDriver={true}
				animationIn="fadeIn"
				animationOut="fadeOut"
				style={{ margin: 0, paddingHorizontal: 32 }}
				onBackdropPress={() => {
					if (isModalClosable) {
						setIsModalVisible(false);
						setIsLoading(false);
					}
				}}
			>
				<View className="flex items-center justify-center gap-12 rounded-xl border border-slate-7 bg-slate-1 px-4 py-12">
					<Text className="text-center">
						ちょっとまって！{"\n"}
						あなたは人間ですか？？
					</Text>
					<RNTurnstile
						resetRef={turnstileResetRef}
						sitekey={process.env.EXPO_PUBLIC_TURNSTILE_SITEKEY!}
						onVerify={token => {
							setIsModalClosable(false);
							setTimeout(() => {
								setIsModalVisible(false);
								setIsModalClosable(true);

								handleSubmit(onSubmit(token))();
							}, 1000);
						}}
						theme="light"
						className="mx-auto w-full overflow-hidden"
					/>
				</View>
			</Modal>
		</Page>
	);
};
