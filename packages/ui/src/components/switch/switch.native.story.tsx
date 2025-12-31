import { View } from "react-native";
import { Switch } from "./switch.native";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

const meta: Meta<typeof Switch> = {
	title: "Components/Switch",
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
			<Switch {...args} checked disabled />
		</View>
	),
};
