import type { Meta, StoryObj } from "@storybook/react";
import { UserIcon } from "./user.native";

const meta: Meta<typeof UserIcon> = {
	component: UserIcon,
};

export default meta;

type Story = StoryObj<typeof UserIcon>;

const Template: Story = {
	render: args => <UserIcon {...args} />,
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
