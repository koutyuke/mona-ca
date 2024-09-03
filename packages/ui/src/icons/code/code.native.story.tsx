import type { Meta, StoryObj } from "@storybook/react";
import { CodeIcon } from "./code.native";

const meta: Meta<typeof CodeIcon> = {
	component: CodeIcon,
};

export default meta;

type Story = StoryObj<typeof CodeIcon>;

const Template: Story = {
	render: args => <CodeIcon {...args} />,
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
