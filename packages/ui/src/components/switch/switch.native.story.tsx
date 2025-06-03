import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { Switch } from "./switch.native";

const meta: Meta<typeof Switch> = {
	title: "components/Switch",
	component: Switch,
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
	args: {},
	render: args => (
		<View className="flex h-full w-full items-center justify-center gap-2">
			<Switch {...args} />
			<Switch {...args} checked />
			<Switch {...args} disabled />
			<Switch {...args} disabled checked />
		</View>
	),
};
