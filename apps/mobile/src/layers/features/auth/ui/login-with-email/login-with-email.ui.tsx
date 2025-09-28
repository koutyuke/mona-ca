import { valibotResolver } from "@hookform/resolvers/valibot";
import { Button, InputWrapper, Text, TextInput } from "@mona-ca/ui/native/components";
import { EmailIcon, PasswordIcon } from "@mona-ca/ui/native/icons";
import { Link } from "expo-router";
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";
import { type LoginFormSchema, loginFormSchema } from "../../model/login-form-schema";

type Props = {
	loading: boolean;
	actions: {
		onSubmit: (data: LoginFormSchema) => void;
	};
	slots: {
		Turnstile: ReactNode;
	};
};

export const LoginWithEmailUI = ({ actions: { onSubmit }, slots: { Turnstile }, loading }: Props) => {
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
