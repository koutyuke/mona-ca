import type { Meta, StoryObj } from "@storybook/react";
import { ArrowIcon } from "./arrow.native";

const meta: Meta<typeof ArrowIcon> = {
	component: ArrowIcon,
};

export default meta;

type Story = StoryObj<typeof ArrowIcon>;

const Template: Story = {
	render: args => <ArrowIcon {...args} />,
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
		direction: {
			options: ["up", "down", "left", "right"],
			control: {
				type: "radio",
			},
		},
	},
};

export const Up: Story = {
	args: {
		direction: "up",
		className: "stroke-black size-12",
	},
	...Template,
};

export const Down: Story = {
	args: {
		direction: "down",
		className: "stroke-black size-12",
	},
	...Template,
};

export const Left: Story = {
	args: {
		direction: "left",
		className: "stroke-black size-12",
	},
	...Template,
};

export const Right: Story = {
	args: {
		direction: "right",
		className: "stroke-black h-12 w-12",
	},
	...Template,
};
