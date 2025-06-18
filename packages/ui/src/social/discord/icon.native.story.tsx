import type { Meta, StoryObj } from "@storybook/react";
import { BlueVioletDiscordIcon } from "./icon.native";

const meta: Meta<typeof BlueVioletDiscordIcon> = {
	title: "social/Discord/Icon",
	component: BlueVioletDiscordIcon,
};

export default meta;

type Story = StoryObj<typeof BlueVioletDiscordIcon>;

export const Default: Story = {
	args: {
		className: "size-64",
	},
	render: args => <BlueVioletDiscordIcon {...args} />,
};
