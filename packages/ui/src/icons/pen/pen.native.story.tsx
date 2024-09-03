import type { Meta, StoryObj } from "@storybook/react";
import { PenIcon } from "./pen.native";

const meta: Meta<typeof PenIcon> = {
	component: PenIcon,
};

export default meta;

type Story = StoryObj<typeof PenIcon>;

const Template: Story = {
	render: args => <PenIcon {...args} />,
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
			options: ["open", "closed"],
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
