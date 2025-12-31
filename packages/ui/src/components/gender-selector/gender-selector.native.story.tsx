import { View } from "react-native";
import { GenderSelector } from "./gender-selector.native";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

const meta: Meta<typeof GenderSelector> = {
	title: "Components/GenderSelector",
	component: GenderSelector,
	argTypes: {
		value: {
			options: ["man", "woman"],
			control: {
				type: "radio",
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof GenderSelector>;

export const Default: Story = {
	args: {
		value: "woman",
	},
	render: args => (
		<View className="w-full px-4">
			<GenderSelector {...args} />
		</View>
	),
};
