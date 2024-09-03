import type { Meta, StoryObj } from "@storybook/react";
import { MonaCaIcon } from "./icon.native";

const meta: Meta<typeof MonaCaIcon> = {
	component: MonaCaIcon,
};

export default meta;

type Story = StoryObj<typeof MonaCaIcon>;

const Template: Story = {
	render: args => <MonaCaIcon {...args} />,
};

export const Default: Story = {
	args: {
		className: "size-64",
	},
	...Template,
};
