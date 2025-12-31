import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { View } from "react-native";
import { ContinueWithEmailButton } from "./email";

const meta: Meta<typeof ContinueWithEmailButton> = {
	title: "Shared/ContinueWithMethodButton/Email",
	component: ContinueWithEmailButton,
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

export type Story = StoryObj<typeof ContinueWithEmailButton>;

export const Default: Story = {
	args: {
		fullWidth: false,
	},
	render: args => (
		<View className="flex flex-col gap-2 px-4">
			<ContinueWithEmailButton {...args} />
			<ContinueWithEmailButton {...args} disabled />
			<ContinueWithEmailButton {...args} loading />
		</View>
	),
};
