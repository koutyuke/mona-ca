import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { ContinueWithDiscordButton } from "./discord";

const meta: Meta<typeof ContinueWithDiscordButton> = {
	title: "Shared/ContinueWithMethodButton/Discord",
	component: ContinueWithDiscordButton,
	argTypes: {
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
		loading: {
			control: {
				type: "boolean",
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof ContinueWithDiscordButton>;

export const Default: Story = {
	args: {
		fullWidth: false,
	},
	render: args => (
		<View className="flex flex-col gap-2 px-4">
			<ContinueWithDiscordButton {...args} />
			<ContinueWithDiscordButton {...args} disabled />
			<ContinueWithDiscordButton {...args} loading />
		</View>
	),
};
