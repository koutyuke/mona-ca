import type { Meta, StoryObj } from "@storybook/react";
import { GoogleButton } from "./button.native";

const meta: Meta<typeof GoogleButton> = {
	component: GoogleButton,
};

export default meta;

type Story = StoryObj<typeof GoogleButton>;

const Template: Story = {
	render: args => <GoogleButton {...args} />,
	argTypes: {
		size: {
			options: ["sm", "md"],
			control: {
				type: "radio",
			},
		},
		fullWidth: {
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

export const Default: Story = {
	...Template,
	args: {
		size: "md",
	},
};
