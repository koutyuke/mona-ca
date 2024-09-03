import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { Text } from "./text.native";

const meta: Meta<typeof Text> = {
	component: Text,
};

export default meta;

type Story = StoryObj<typeof Text>;

const Template: Story = {
	render: args => <Text {...args} />,
	argTypes: {
		size: {
			options: ["sm", "md", "lg"],
			control: {
				type: "radio",
			},
		},
		bold: {
			control: {
				type: "boolean",
			},
		},
		isTruncated: {
			control: {
				type: "boolean",
			},
		},
	},
};

export const AllSizes: Story = {
	args: {
		children: "Hello world",
		className: "text-slate-12",
	},
	parameters: {
		docs: {
			description: {
				story: "This story shows the text component in all sizes.",
			},
		},
	},
	render: args => (
		<View className="flex flex-col gap-2 ">
			<Text {...args} size="sm" />
			<Text {...args} size="md" />
			<Text {...args} size="lg" />
		</View>
	),
};

export const Default: Story = {
	args: {
		children: "Hello world",
	},
	...Template,
};

export const Bold: Story = {
	args: {
		children: "Hello world",
		bold: true,
	},
	...Template,
};

export const Truncated: Story = {
	args: {
		children: "Hello world! This is a very long text that should be truncated.",
		isTruncated: true,
	},
	...Template,
};
