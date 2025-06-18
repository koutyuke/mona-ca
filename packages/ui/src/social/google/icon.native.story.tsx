import type { Meta, StoryObj } from "@storybook/react";
import { GoogleIcon } from "./icon.native";

const meta: Meta<typeof GoogleIcon> = {
	title: "social/Google/Icon",
	component: GoogleIcon,
};

export default meta;

type Story = StoryObj<typeof GoogleIcon>;

export const Default: Story = {
	args: {
		className: "size-64",
	},
	render: args => <GoogleIcon {...args} />,
};
