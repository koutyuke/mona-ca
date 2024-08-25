import type { Meta, StoryObj } from "@storybook/react";
import { ChevronIcon } from "./chevron.native";

const meta: Meta<typeof ChevronIcon> = {
	component: ChevronIcon,
};

export default meta;

type Story = StoryObj<typeof ChevronIcon>;

const Template: Story = {
	render: args => <ChevronIcon {...args} />,
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
		className: "stroke-black size-12",
	},
	...Template,
};
