import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { View } from "react-native";
import { Radio } from "./radio.native";

const meta: Meta<typeof Radio> = {
	title: "Components/Radio",
	component: Radio,
};

export default meta;

type Story = StoryObj<typeof Radio>;

export const Default: Story = {
	args: {},
	render: args => (
		<View className="flex h-full w-full items-center justify-center gap-2">
			<Radio {...args} />
			<Radio {...args} checked />
			<Radio {...args} disabled />
			<Radio {...args} disabled checked />
		</View>
	),
};
