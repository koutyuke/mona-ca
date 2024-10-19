import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { GenderSelector } from "./gender-selector.native";

const meta: Meta<typeof GenderSelector> = {
	component: GenderSelector,
};

export default meta;

type Story = StoryObj<typeof GenderSelector>;

const Template: Story = {
	render: args => (
		<View className="w-full px-4">
			<GenderSelector {...args} />
		</View>
	),
	argTypes: {
		defaultGender: {
			options: ["man", "woman"],
			control: {
				type: "radio",
			},
		},
	},
};

export const Default: Story = {
	args: {
		defaultGender: "man",
	},
	...Template,
};
