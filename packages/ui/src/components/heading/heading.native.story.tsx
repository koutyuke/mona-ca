import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { Heading } from "./heading.native";

const meta: Meta<typeof Heading> = {
	component: Heading,
};

export default meta;

type Story = StoryObj<typeof Heading>;

const Template: Story = {
	render: args => <Heading {...args} />,
	argTypes: {
		level: {
			options: ["1", "2", "3", "4"],
			control: {
				type: "radio",
			},
		},
		isTruncated: {
			control: {
				type: "boolean",
			},
		},
	},
};

export const AllLevels: Story = {
	args: {
		children: "Hello world",
		className: "text-slate-12",
	},
	parameters: {
		docs: {
			description: {
				story: "This story shows the heading component in all levels.",
			},
		},
	},
	render: args => (
		<View className="flex flex-col gap-2 ">
			<Heading {...args} level="1" />
			<Heading {...args} level="2" />
			<Heading {...args} level="3" />
			<Heading {...args} level="4" />
		</View>
	),
};

export const Default: Story = {
	args: {
		children: "Hello world",
	},
	...Template,
};

export const Truncated: Story = {
	args: {
		children: "Hello world this is a very long text that should be truncated",
		isTruncated: true,
	},
	...Template,
};
