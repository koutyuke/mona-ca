import type { Meta, StoryObj } from "@storybook/react";
import { GoogleIcon } from "./icon.native";

const meta: Meta<typeof GoogleIcon> = {
	component: GoogleIcon,
};

export default meta;

type Story = StoryObj<typeof GoogleIcon>;

const Template: Story = {
	render: args => <GoogleIcon {...args} />,
};

export const Default: Story = {
	args: {
		className: "size-64",
	},
	...Template,
};
