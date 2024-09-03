import type { Meta, StoryObj } from "@storybook/react";
import { MonaCaLogo } from "./logo.native";

const meta: Meta<typeof MonaCaLogo> = {
	component: MonaCaLogo,
};

export default meta;

type Story = StoryObj<typeof MonaCaLogo>;

const Template: Story = {
	render: args => <MonaCaLogo {...args} />,
};

export const Default: Story = {
	args: {
		className: "h-16",
	},
	...Template,
};
