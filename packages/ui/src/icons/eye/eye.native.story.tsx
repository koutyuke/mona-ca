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
		visible: {
			options: [true, false],
			control: {
				type: "boolean",
			},
		},
	},
};

export const Visible: Story = {
	args: {
		visible: true,
		className: "stroke-black size-12",
	},
	...Template,
};

export const Invisible: Story = {
	args: {
		visible: false,
		className: "stroke-black size-12",
	},
	...Template,
};
