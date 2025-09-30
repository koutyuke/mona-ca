import type { Meta, StoryObj } from "@storybook/react";
import { __DEV_LoginWithSocial } from "./login-with-social.dev";
import { LoginWithSocialUI } from "./login-with-social.ui";

const meta: Meta<typeof LoginWithSocialUI> = {
	title: "Features/Auth/LoginWithSocial",
	component: LoginWithSocialUI,
};

export default meta;

type Story = StoryObj<typeof LoginWithSocialUI>;

export const Default: Story = {
	args: __DEV_LoginWithSocial.props.default(),
};

export const PendingGoogle: Story = {
	args: __DEV_LoginWithSocial.props.pendingGoogle(),
};

export const WithError: Story = {
	args: __DEV_LoginWithSocial.props.error(),
};
