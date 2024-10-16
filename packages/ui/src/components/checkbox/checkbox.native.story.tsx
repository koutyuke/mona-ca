import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { CheckBox } from "./checkbox.native";

const meta: Meta<typeof CheckBox> = {
	component: CheckBox,
};

export default meta;

type Story = StoryObj<typeof CheckBox>;

const Template: Story = {
	render: args => (
		<View className="w-full px-2">
			<CheckBox {...args} />
		</View>
	),
	argTypes: {
		size: {
			options: ["sm", "md"],
			control: {
				type: "radio",
			},
		},
		checked: {
			control: {
				type: "boolean",
			},
		},
		disabled: {
			control: {
				type: "boolean",
			},
		},
		label: {
			control: {
				type: "text",
			},
		},
		labelPosition: {
			options: ["left", "right"],
			control: {
				type: "radio",
			},
		},
	},
};

export const Default: Story = {
	args: {
		label: "Label",
		labelColorClassName: "text-slate-12",
	},
	...Template,
};
