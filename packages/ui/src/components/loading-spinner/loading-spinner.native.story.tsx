import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { LoadingSpinner } from "./loading-spinner.native";

const meta: Meta<typeof LoadingSpinner> = {
	title: "Components/LoadingSpinner",
	component: LoadingSpinner,
	argTypes: {
		size: {
			control: "number",
		},
	},
};

export default meta;

type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {
	args: {
		size: 32,
	},
	render: args => (
		<View className="flex h-full w-full flex-col items-center justify-center">
			<LoadingSpinner {...args} />
		</View>
	),
};
