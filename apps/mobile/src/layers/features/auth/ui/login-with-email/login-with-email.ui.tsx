import { valibotResolver } from "@hookform/resolvers/valibot";
import { Alert, Button, InputWrapper, Text, TextInput } from "@mona-ca/ui/native/components";
import { EmailIcon, PasswordIcon } from "@mona-ca/ui/native/icons";
import { Link } from "expo-router";
import type { JSX, ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { type LoginFormSchema, loginFormSchema } from "../../model/login-form-schema";

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
	const { control, trigger, getValues } = useForm({
		resolver: valibotResolver(loginFormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		mode: "onChange",
	});

	return (
		<View className="flex w-full flex-col gap-2">
			{error && <Alert type="error" title={error} />}
			<Controller
				name="email"
				control={control}
				render={({ field: { onBlur, onChange, value, ref }, fieldState: { error: validationError } }) => (
					<InputWrapper label="メールアドレス" error={validationError?.message ?? ""}>
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
				render={({ field: { onBlur, onChange, value, ref }, fieldState: { error: validationError } }) => (
					<InputWrapper label="パスワード" error={validationError?.message ?? ""}>
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
				<Pressable className="group self-end">
					<Text size="sm" className="text-salmon-9 transition-colors group-active:text-salmon-11">
						パスワードをお忘れですか？
					</Text>
				</Pressable>
			</Link>
			<Button
				className="mt-2 w-full"
				variant="filled"
				color="salmon"
				onPress={async () => {
					const isValid = await trigger();
					if (isValid) {
						const values = getValues();
						onSubmit(values);
					}
				}}
				loading={loading}
			>
				ログイン
			</Button>
			{Turnstile}
		</View>
	);
};
