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
		state: {
			options: ["up", "down", "left", "right"],
			control: {
				type: "radio",
			},
		},
	},
};

export const Up: Story = {
	args: {
		state: "up",
		className: "stroke-black size-12",
	},
	...Template,
};

export const Down: Story = {
	args: {
		state: "down",
		className: "stroke-black size-12",
	},
	...Template,
};

export const Left: Story = {
	args: {
		state: "left",
		className: "stroke-black size-12",
	},
	...Template,
};

export const Right: Story = {
	args: {
		state: "right",
		className: "stroke-black size-12",
	},
	...Template,
};
