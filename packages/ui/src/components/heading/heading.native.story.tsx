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
			options: ["1", "2"],
			control: {
				type: "radio",
			},
		},
		truncated: {
			control: {
				type: "boolean",
			},
		},
		bold: {
			control: {
				type: "boolean",
			},
		},
	},
};

export const AllLevels: Story = {
	args: {
		children: "Hello world",
	},
	argTypes: {
		truncated: {
			control: {
				type: "boolean",
			},
		},
		bold: {
			control: {
				type: "boolean",
			},
		},
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
			<Heading {...args} level="1" className="text-slate-12" />
			<Heading {...args} level="2" className="text-slate-12" />
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
		truncated: true,
	},
	...Template,
};
