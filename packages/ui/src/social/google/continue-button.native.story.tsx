import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { ContinueWithGoogleButton } from "./continue-button.native";

const meta: Meta<typeof ContinueWithGoogleButton> = {
	title: "social/Google/ContinueWithGoogleButton",
	component: ContinueWithGoogleButton,
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

type Story = StoryObj<typeof ContinueWithGoogleButton>;

export const Default: Story = {
	args: {
		fullWidth: false,
	},
	render: args => (
		<View className="flex flex-col gap-2 px-4">
			<ContinueWithGoogleButton {...args} />
			<ContinueWithGoogleButton {...args} disabled />
			<ContinueWithGoogleButton {...args} loading />
		</View>
	),
};
