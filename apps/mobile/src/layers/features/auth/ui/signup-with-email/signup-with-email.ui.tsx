import { valibotResolver } from "@hookform/resolvers/valibot";
import { Alert, Button, GenderSelector, InputWrapper, TextInput } from "@mona-ca/ui/native/components";
import { PasswordIcon, UserIcon } from "@mona-ca/ui/native/icons";
import type { JSX, ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { type SignupFormSchema, signupFormSchema } from "../../model/signup-form-schema";

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
			{error && <Alert type="error" title={error} />}
			<Controller
				name="password"
				control={control}
				render={({ field: { onChange, value, onBlur }, fieldState: { error: validationError } }) => (
					<InputWrapper label="パスワード" error={validationError?.message ?? ""}>
						<TextInput
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
			<Controller
				name="name"
				control={control}
				render={({ field: { onChange, value, onBlur }, fieldState: { error: validationError } }) => (
					<InputWrapper label="ユーザー名" error={validationError?.message ?? ""}>
						<TextInput
							placeholder="User Name"
							icon={UserIcon}
							value={value}
							onChangeText={onChange}
							onBlur={onBlur}
							textContentType="username"
						/>
					</InputWrapper>
				)}
			/>
			<Controller
				name="gender"
				control={control}
				render={({ field: { onChange, value }, fieldState: { error: validationError } }) => (
					<InputWrapper label="性別" error={validationError?.message ?? ""} className="mb-auto">
						<GenderSelector value={value} onChange={onChange} />
					</InputWrapper>
				)}
			/>
			<Button
				className="mt-6 w-full"
				variant="filled"
				color="salmon"
				onPress={handleSubmit(onSubmit)}
				loading={loading}
			>
				新規登録
			</Button>
			{Turnstile}
		</View>
	);
};
