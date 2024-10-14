import type { Meta, StoryObj } from "@storybook/react";
import { CheckIcon } from "./check.native";

const meta: Meta<typeof CheckIcon> = {
	component: CheckIcon,
};

export default meta;

type Story = StoryObj<typeof CheckIcon>;

const Template: Story = {
	render: args => <CheckIcon {...args} />,
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
		className: "stroke-slate-12 size-12",
	},
	...Template,
};
