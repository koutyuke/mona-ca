import type { Meta, StoryObj } from "@storybook/react";
import { MonaCaLogo } from "./logo.native";

const meta: Meta<typeof MonaCaLogo> = {
	title: "brand/Logo",
	component: MonaCaLogo,
};

export default meta;

type Story = StoryObj<typeof MonaCaLogo>;

export const Default: Story = {
	args: {
		className: "h-16",
	},
	render: args => <MonaCaLogo {...args} />,
};
