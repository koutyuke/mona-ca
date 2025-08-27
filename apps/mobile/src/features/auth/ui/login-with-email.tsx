import { valibotResolver } from "@hookform/resolvers/valibot";
import { isErr } from "@mona-ca/core/utils";
import { Button, InputWrapper, Text, TextInput } from "@mona-ca/ui/native/components";
import { EmailIcon, PasswordIcon } from "@mona-ca/ui/native/icons";
import { Link } from "expo-router";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { ReactNativeModal as Modal } from "react-native-modal";
import RNTurnstile from "react-native-turnstile";
import { lastLoginMethodAtom, sessionTokenAtom } from "../../../entities/session";
import { getMe, userStorageAtom } from "../../../entities/user";
import { dtoToUser } from "../../../entities/user/lib/converter";
import { login } from "../api/login-with-email";
import { type LoginFormSchema, loginFormSchema } from "../model/login-form-schema";

export const LoginWithEmail = () => {
	const setSessionToken = useSetAtom(sessionTokenAtom);
	const setLastLoginMethod = useSetAtom(lastLoginMethodAtom);
	const setUserStorage = useSetAtom(userStorageAtom);

	const [isModalClosable, setModalClosable] = useState<boolean>(true);
	const [isModalVisible, setModalVisible] = useState(false);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const { control, handleSubmit, trigger } = useForm({
		resolver: valibotResolver(loginFormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		mode: "onChange",
	});

	const onSubmit: (turnstileToken: string) => SubmitHandler<LoginFormSchema> = turnstileToken => async data => {
		const loginResult = await login(data.email, data.password, turnstileToken);
		if (isErr(loginResult)) {
			setErrorMessage(loginResult.value.errorMessage);
			setLoading(false);
			return;
		}
		const { sessionToken } = loginResult.value;

		const userResult = await getMe(sessionToken);

		if (isErr(userResult)) {
			// TODO: set log
			setErrorMessage("ユーザーの取得に失敗しました");
			setLoading(false);
			return;
		}

		setSessionToken(sessionToken);
		setUserStorage({ data: dtoToUser(userResult.value), timestamp: Date.now() });
		setLastLoginMethod("email");

		setErrorMessage(null);
		setLoading(false);
	};

	const handleTurnstileVerify = (token: string) => {
		setModalClosable(false);
		setTimeout(() => {
			setModalVisible(false);
			setModalClosable(true);

			const submitHandler = onSubmit(token);
			const formSubmitter = handleSubmit(submitHandler);
			formSubmitter();
		}, 1000);
	};

	return (
		<View className="flex w-full flex-col gap-2">
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
							textContentType="password"
						/>
					</InputWrapper>
				)}
			/>
			<Link href="/(auth)/forgot-password" asChild>
				<Pressable className="group">
					<Text size="xs" className="self-end text-salmon-9 transition-colors group-active:text-salmon-11">
						パスワードをお忘れですか？
					</Text>
				</Pressable>
			</Link>
			{errorMessage && (
				<Text size="xs" className="text-red-9">
					{errorMessage}
				</Text>
			)}
			<Button
				className="mt-2 w-full"
				variant="filled"
				color="salmon"
				onPress={async () => {
					const isValid = await trigger();
					if (isValid) {
						setModalVisible(true);
						setLoading(true);
					}
				}}
				loading={isLoading}
			>
				Log In
			</Button>
			<Modal
				isVisible={isModalVisible}
				hideModalContentWhileAnimating={true}
				useNativeDriver={true}
				animationIn="fadeIn"
				animationOut="fadeOut"
				style={{ margin: 0, paddingHorizontal: 32 }}
				onBackdropPress={() => {
					if (isModalClosable) {
						setModalVisible(false);
						setLoading(false);
					}
				}}
			>
				<View className="flex items-center justify-center gap-12 rounded-xl border border-slate-7 bg-slate-1 px-4 py-12">
					<Text className="text-center">ちょっとまって！{"\n"}あなたは人間ですか？？</Text>
					<RNTurnstile
						sitekey={process.env.EXPO_PUBLIC_TURNSTILE_SITEKEY!}
						onVerify={handleTurnstileVerify}
						theme="light"
						className="mx-auto w-full overflow-hidden"
					/>
				</View>
			</Modal>
		</View>
	);
};
