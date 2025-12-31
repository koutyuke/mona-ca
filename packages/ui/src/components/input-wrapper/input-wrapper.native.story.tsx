import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { View } from "react-native";
import { EmailIcon } from "../../icons/index.native";
import { TextInput } from "../text-input/index.native";
import { InputWrapper } from "./input-wrapper.native";

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
			<TextInput placeholder="example@email.com" icon={EmailIcon} />
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
			<TextInput placeholder="example@email.com" icon={EmailIcon} error />
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
			<TextInput placeholder="パスワードを入力" credentials />
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
			<TextInput value="username123" disabled />
		</InputWrapper>
	),
};

export const AllVariants: Story = {
	render: () => (
		<View className="flex w-full flex-col gap-6 p-4">
			<InputWrapper label="メールアドレス" description="ログインに使用するメールアドレスを入力してください">
				<TextInput placeholder="example@email.com" icon={EmailIcon} />
			</InputWrapper>

			<InputWrapper label="パスワード" description="8文字以上で入力してください" required>
				<TextInput placeholder="パスワードを入力" credentials />
			</InputWrapper>

			<InputWrapper label="メールアドレス" error="有効なメールアドレスを入力してください">
				<TextInput placeholder="example@email.com" icon={EmailIcon} error />
			</InputWrapper>

			<InputWrapper label="ユーザー名" description="変更できません" disabled>
				<TextInput value="username123" disabled />
			</InputWrapper>
		</View>
	),
};
