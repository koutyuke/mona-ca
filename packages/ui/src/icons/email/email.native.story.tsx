import type { Meta, StoryObj } from "@storybook/react";
import { EmailIcon } from "./email.native";

const meta: Meta<typeof EmailIcon> = {
	component: EmailIcon,
};

export default meta;

type Story = StoryObj<typeof EmailIcon>;

const Template: Story = {
	render: args => <EmailIcon {...args} />,
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
