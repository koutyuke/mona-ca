import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { MonaCaDarkIcon, MonaCaLightIcon } from "./icon.native";

const meta: Meta<typeof MonaCaLightIcon> = {
	title: "brand/Icon",
	component: MonaCaLightIcon,
};

export default meta;

type Story = StoryObj<typeof MonaCaLightIcon>;

export const Default: Story = {
	args: {
		className: "size-64",
	},
	render: args => (
		<View className="flex-1 items-center justify-center">
			<MonaCaLightIcon {...args} />
			<MonaCaDarkIcon {...args} />
		</View>
	),
};
