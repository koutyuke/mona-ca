import type { Meta, StoryObj } from "@storybook/react";
import { LoadingSpinner } from "./loading-spinner.native";

const meta: Meta<typeof LoadingSpinner> = {
	component: LoadingSpinner,
};

export default meta;

type Story = StoryObj<typeof LoadingSpinner>;

const Template: Story = {
	render: args => <LoadingSpinner {...args} />,
	argTypes: {
		className: {
			control: "text",
		},
	},
};

export const Black: Story = {
	args: {
		className: "fill-black size-8",
	},
	...Template,
};

export const White: Story = {
	args: {
		className: "fill-white size-8",
	},
	...Template,
};
