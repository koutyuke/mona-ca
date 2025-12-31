import { Alert, Button, GenderSelector, InputWrapper, TextInput } from "@mona-ca/ui/native/components";
import { PasswordIcon, UserIcon } from "@mona-ca/ui/native/icons";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { signupFormSchema } from "../../model/signup-form-schema";

import type { JSX, ReactNode } from "react";
import type { SignupFormSchema } from "../../model/signup-form-schema";

type Props = {
	loading: boolean;
	error: string | null;
	actions: {
		onSubmit: (data: SignupFormSchema) => void;
	};
	slots: {
		Turnstile: ReactNode;
	};
};

export const SignupWithEmailUI = ({
	loading,
	error,
	actions: { onSubmit },
	slots: { Turnstile },
}: Props): JSX.Element => {
	const { control, handleSubmit } = useForm({
		resolver: valibotResolver(signupFormSchema),
		defaultValues: {
			password: "",
			name: "",
		},
		mode: "onChange",
	});

	return (
		<View className="flex w-full flex-1 flex-col gap-3">
			{error && <Alert title={error} type="error" />}
			<Controller
				control={control}
				name="password"
				render={({ field: { onChange, value, onBlur }, fieldState: { error: validationError } }) => (
					<InputWrapper error={validationError?.message ?? ""} label="パスワード">
						<TextInput
							credentials
							icon={PasswordIcon}
							onBlur={onBlur}
							onChangeText={onChange}
							placeholder="Password"
							textContentType="password"
							value={value}
						/>
					</InputWrapper>
				)}
			/>
			<Controller
				control={control}
				name="name"
				render={({ field: { onChange, value, onBlur }, fieldState: { error: validationError } }) => (
					<InputWrapper error={validationError?.message ?? ""} label="ユーザー名">
						<TextInput
							icon={UserIcon}
							onBlur={onBlur}
							onChangeText={onChange}
							placeholder="User Name"
							textContentType="username"
							value={value}
						/>
					</InputWrapper>
				)}
			/>
			<Controller
				control={control}
				name="gender"
				render={({ field: { onChange, value }, fieldState: { error: validationError } }) => (
					<InputWrapper className="mb-auto" error={validationError?.message ?? ""} label="性別">
						<GenderSelector onChange={onChange} value={value} />
					</InputWrapper>
				)}
			/>
			<Button
				className="mt-6 w-full"
				color="salmon"
				loading={loading}
				onPress={handleSubmit(onSubmit)}
				variant="filled"
			>
				新規登録
			</Button>
			{Turnstile}
		</View>
	);
};
