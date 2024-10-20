import type { Meta, StoryObj } from "@storybook/react";
import { Wave } from "./wave.presenter";

const meta: Meta<typeof Wave> = {
	component: Wave,
};

export default meta;

type Story = StoryObj<typeof Wave>;

const Template: Story = {
	render: args => <Wave {...args} />,
};

export const Default: Story = {
	args: {
		className: "h-8 w-full fill-salmon-6",
	},
	...Template,
};
