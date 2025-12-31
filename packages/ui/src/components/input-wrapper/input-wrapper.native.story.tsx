import { View } from "react-native";
import { EmailIcon } from "../../icons/index.native";
import { TextInput } from "../text-input/index.native";
import { InputWrapper } from "./input-wrapper.native";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

const meta: Meta<typeof InputWrapper> = {
	title: "Components/InputWrapper",
	component: InputWrapper,
	argTypes: {
		label: {
			control: {
				type: "text",
			},
		},
		description: {
			control: {
				type: "text",
			},
		},
		error: {
			control: {
				type: "text",
			},
		},
		required: {
			control: {
				type: "boolean",
			},
		},
		disabled: {
			control: {
				type: "boolean",
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof InputWrapper>;

export const Default: Story = {
	args: {
		label: "メールアドレス",
		description: "ログインに使用するメールアドレスを入力してください",
	},
	render: args => (
		<InputWrapper {...args}>
			<TextInput icon={EmailIcon} placeholder="example@email.com" />
		</InputWrapper>
	),
};

export const WithError: Story = {
	args: {
		label: "メールアドレス",
		error: "有効なメールアドレスを入力してください",
	},
	render: args => (
		<InputWrapper {...args}>
			<TextInput error icon={EmailIcon} placeholder="example@email.com" />
		</InputWrapper>
	),
};

export const Required: Story = {
	args: {
		label: "パスワード",
		description: "8文字以上で入力してください",
		required: true,
	},
	render: args => (
		<InputWrapper {...args}>
			<TextInput credentials placeholder="パスワードを入力" />
		</InputWrapper>
	),
};

export const Disabled: Story = {
	args: {
		label: "ユーザー名",
		description: "変更できません",
		disabled: true,
	},
	render: args => (
		<InputWrapper {...args}>
			<TextInput disabled value="username123" />
		</InputWrapper>
	),
};

export const AllVariants: Story = {
	render: () => (
		<View className="flex w-full flex-col gap-6 p-4">
			<InputWrapper description="ログインに使用するメールアドレスを入力してください" label="メールアドレス">
				<TextInput icon={EmailIcon} placeholder="example@email.com" />
			</InputWrapper>

			<InputWrapper description="8文字以上で入力してください" label="パスワード" required>
				<TextInput credentials placeholder="パスワードを入力" />
			</InputWrapper>

			<InputWrapper error="有効なメールアドレスを入力してください" label="メールアドレス">
				<TextInput error icon={EmailIcon} placeholder="example@email.com" />
			</InputWrapper>

			<InputWrapper description="変更できません" disabled label="ユーザー名">
				<TextInput disabled value="username123" />
			</InputWrapper>
		</View>
	),
};
