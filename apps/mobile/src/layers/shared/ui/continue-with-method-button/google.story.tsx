import { View } from "react-native";
import { ContinueWithGoogleButton } from "./google";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

const meta: Meta<typeof ContinueWithGoogleButton> = {
	title: "Shared/ContinueWithMethodButton/Google",
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
