import type { Meta, StoryObj } from "@storybook/react";
import { DiscordIcon } from "./icon.native";

const meta: Meta<typeof DiscordIcon> = {
	component: DiscordIcon,
};

export default meta;

type Story = StoryObj<typeof DiscordIcon>;

const Template: Story = {
	render: args => <DiscordIcon {...args} />,
};

export const Default: Story = {
	args: {
		className: "size-64",
	},
	...Template,
};
