import { View } from "react-native";
import { __DEV_SignupWithEmail } from "./signup-with-email.dev";
import { SignupWithEmailUI } from "./signup-with-email.ui";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

const meta: Meta<typeof SignupWithEmailUI> = {
	title: "Features/Auth/SignupWithEmail",
	component: SignupWithEmailUI,
	render: args => {
		return (
			<View className="flex w-full flex-1 items-center justify-center p-4">
				<SignupWithEmailUI {...args} />
			</View>
		);
	},
};

export default meta;

type Story = StoryObj<typeof SignupWithEmailUI>;

export const Default: Story = {
	args: __DEV_SignupWithEmail.props.default(),
};

export const Loading: Story = {
	args: __DEV_SignupWithEmail.props.loading(),
};

export const WithError: Story = {
	args: __DEV_SignupWithEmail.props.error(),
};
