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
		size: 64,
	},
	render: args => (
		<View className="flex h-full w-full flex-col gap-2">
			<LoadingSpinner {...args} color="gray" />
			<LoadingSpinner {...args} color="white" />
			<LoadingSpinner {...args} color="black" />
		</View>
	),
};
