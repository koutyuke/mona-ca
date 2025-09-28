import type { Meta, StoryObj } from "@storybook/react";
import { __DEV_LastLoginMethod } from "./last-login-method.dev";
import { LastLoginMethodUI } from "./last-login-method.ui";

const meta: Meta<typeof LastLoginMethodUI> = {
	title: "Features/Auth/LastLoginMethod",
	component: LastLoginMethodUI,
};

export default meta;

type Story = StoryObj<typeof LastLoginMethodUI>;

export const WithMethod: Story = {
	args: __DEV_LastLoginMethod.props.withMethod(),
};

export const Empty: Story = {
	args: __DEV_LastLoginMethod.props.empty(),
};
