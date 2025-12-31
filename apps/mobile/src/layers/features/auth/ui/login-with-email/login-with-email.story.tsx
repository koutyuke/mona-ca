import { __DEV_LoginWithEmail } from "./login-with-email.dev";
import { LoginWithEmailUI } from "./login-with-email.ui";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

const meta: Meta<typeof LoginWithEmailUI> = {
	title: "Features/Auth/LoginWithEmail",
	component: LoginWithEmailUI,
};

export default meta;

type Story = StoryObj<typeof LoginWithEmailUI>;

export const Default: Story = {
	args: __DEV_LoginWithEmail.props.default(),
};

export const Loading: Story = {
	args: __DEV_LoginWithEmail.props.loading(),
};

export const WithError: Story = {
	args: __DEV_LoginWithEmail.props.error(),
};
