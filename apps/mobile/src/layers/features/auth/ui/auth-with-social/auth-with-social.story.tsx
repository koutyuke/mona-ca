import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { __DEV_AuthWithSocial } from "./auth-with-social.dev";
import { AuthWithSocialUI } from "./auth-with-social.ui";

const meta: Meta<typeof AuthWithSocialUI> = {
	title: "Features/Auth/AuthWithSocial",
	component: AuthWithSocialUI,
};

export default meta;

type Story = StoryObj<typeof AuthWithSocialUI>;

export const Default: Story = {
	args: __DEV_AuthWithSocial.props.default(),
};

export const PendingGoogle: Story = {
	args: __DEV_AuthWithSocial.props.pendingGoogle(),
};

export const WithError: Story = {
	args: __DEV_AuthWithSocial.props.error(),
};
