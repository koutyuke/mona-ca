import type { Meta, StoryObj } from "@storybook/react";
import { EyeIcon } from "./eye.native";

const meta: Meta<typeof EyeIcon> = {
	component: EyeIcon,
};

export default meta;

type Story = StoryObj<typeof EyeIcon>;

const Template: Story = {
	render: args => <EyeIcon {...args} />,
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
		state: {
			options: ["on", "off"],
			control: {
				type: "radio",
			},
		},
	},
};

export const Visible: Story = {
	args: {
		state: "on",
		className: "stroke-black size-12",
	},
	...Template,
};

export const Invisible: Story = {
	args: {
		state: "off",
		className: "stroke-black size-12",
	},
	...Template,
};
