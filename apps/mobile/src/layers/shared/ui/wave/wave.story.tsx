import type { Meta, StoryObj } from "@storybook/react";
import { Wave } from "./wave";

const meta: Meta<typeof Wave> = {
	title: "Shared/Wave",
	component: Wave,
};

export default meta;

type Story = StoryObj<typeof Wave>;

export const Default: Story = {
	render: args => <Wave {...args} />,
	args: {
		className: "w-full color-red-9",
	},
};
