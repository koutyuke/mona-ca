import type { Meta, StoryObj } from "@storybook/react";
import { DiscordButton } from "./button.native";

const meta: Meta<typeof DiscordButton> = {
	component: DiscordButton,
};

export default meta;

type Story = StoryObj<typeof DiscordButton>;

const Template: Story = {
	render: args => <DiscordButton {...args} />,
	argTypes: {
		size: {
			options: ["sm", "md"],
			control: {
				type: "radio",
			},
		},
		fullWidth: {
			control: {
				type: "boolean",
			},
		},
		disabled: {
			control: {
				type: "boolean",
			},
		},
	},
};

export const Default: Story = {
	...Template,
	args: {
		size: "md",
		fullWidth: false,
	},
};
