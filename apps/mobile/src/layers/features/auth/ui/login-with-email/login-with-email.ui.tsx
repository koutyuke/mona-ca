import { Alert, Button, InputWrapper, Text, TextInput } from "@mona-ca/ui/native/components";
import { EmailIcon, PasswordIcon } from "@mona-ca/ui/native/icons";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { loginFormSchema } from "../../model/login-form-schema";

import type { JSX, ReactNode } from "react";
import type { LoginFormSchema } from "../../model/login-form-schema";

type Props = {
	loading: boolean;
	error: string | null;
	actions: {
		onSubmit: (data: LoginFormSchema) => void;
	};
	slots: {
		Turnstile: ReactNode;
	};
};

export const LoginWithEmailUI = ({
	loading,
	error,
	actions: { onSubmit },
	slots: { Turnstile },
}: Props): JSX.Element => {
	const { control, handleSubmit } = useForm({
		resolver: valibotResolver(loginFormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		mode: "onChange",
	});

	return (
		<View className="flex w-full flex-col gap-3">
			{error && <Alert title={error} type="error" />}
			<Controller
				control={control}
				name="email"
				render={({ field: { onBlur, onChange, value, ref }, fieldState: { error: validationError } }) => (
					<InputWrapper error={validationError?.message ?? ""} label="メールアドレス">
						<TextInput
							icon={EmailIcon}
							onBlur={onBlur}
							onChangeText={onChange}
							placeholder="Email"
							ref={ref}
							value={value}
						/>
					</InputWrapper>
				)}
			/>
			<Controller
				control={control}
				name="password"
				render={({ field: { onBlur, onChange, value, ref }, fieldState: { error: validationError } }) => (
					<InputWrapper error={validationError?.message ?? ""} label="パスワード">
						<TextInput
							credentials
							icon={PasswordIcon}
							onBlur={onBlur}
							onChangeText={onChange}
							placeholder="Password"
							ref={ref}
							textContentType="password"
							value={value}
						/>
					</InputWrapper>
				)}
			/>
			<Link asChild href="/(auth)/forgot-password">
				<Pressable className="group self-end">
					<Text className="text-salmon-9 transition-colors group-active:text-salmon-11" size="sm">
						パスワードをお忘れですか？
					</Text>
				</Pressable>
			</Link>
			<Button className="w-full" color="salmon" loading={loading} onPress={handleSubmit(onSubmit)} variant="filled">
				ログイン
			</Button>
			{Turnstile}
		</View>
	);
};
