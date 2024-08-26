import type { Meta, StoryObj } from "@storybook/react";
import { BrandLogo } from "./logo.native";

const meta: Meta<typeof BrandLogo> = {
	component: BrandLogo,
};

export default meta;

type Story = StoryObj<typeof BrandLogo>;

const Template: Story = {
	render: args => <BrandLogo {...args} />,
};

export const Default: Story = {
	args: {
		className: "h-16",
	},
	...Template,
};
