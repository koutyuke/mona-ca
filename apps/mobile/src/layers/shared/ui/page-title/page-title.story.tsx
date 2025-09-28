import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { PageTitle } from "./page-title";

const meta: Meta<typeof PageTitle> = {
	title: "Widgets/Layout/PageTitle",
	component: PageTitle,
	render: args => (
		<View className="w-full p-4">
			<PageTitle {...args} />
		</View>
	),
};

export default meta;

export const Default: StoryObj<typeof PageTitle> = {
	args: {
		children: "Page Title",
	},
};
