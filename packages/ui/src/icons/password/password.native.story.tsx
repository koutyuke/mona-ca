import type { Meta, StoryObj } from "@storybook/react";
import { PasswordIcon } from "./password.native";

const meta: Meta<typeof PasswordIcon> = {
	component: PasswordIcon,
};

export default meta;

type Story = StoryObj<typeof PasswordIcon>;

const Template: Story = {
	render: args => <PasswordIcon {...args} />,
	argTypes: {
		className: {
			control: "text",
		},
		size: {
			control: "number",
		},
		strokeWidth: {
			control: "number",
		},
		color: {
			control: "color",
		},
	},
};

export const Default: Story = {
	args: {
		className: "stroke-black size-12",
	},
	...Template,
};
