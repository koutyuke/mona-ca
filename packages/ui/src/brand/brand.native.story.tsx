import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { MonaCaDarkIcon, MonaCaLightIcon, MonaCaLogo } from "./brand.native";

const meta: Meta<typeof MonaCaLightIcon> = {
	title: "Brand/Brand",
	component: MonaCaLightIcon,
};

export default meta;

type Story = StoryObj<typeof MonaCaLightIcon>;

export const Icons: Story = {
	args: {
		className: "size-64",
	},
	render: args => (
		<View className="flex-1 items-center justify-center gap-4">
			<MonaCaLightIcon {...args} />
			<MonaCaDarkIcon {...args} />
		</View>
	),
};

export const Logo: Story = {
	args: {
		className: "h-16",
	},
	render: args => (
		<View className="flex-1 items-center justify-center gap-4">
			<MonaCaLogo {...args} />
		</View>
	),
};
