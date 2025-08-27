import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { CheckBox } from "./checkbox.native";

const meta: Meta<typeof CheckBox> = {
	title: "Components/CheckBox",
	component: CheckBox,
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
	},
};

export default meta;

type Story = StoryObj<typeof CheckBox>;

export const Default: Story = {
	args: {
		size: "md",
	},
	render: args => (
		<View className="flex h-full w-full items-center justify-center gap-2">
			<CheckBox {...args} />
			<CheckBox {...args} checked={true} />
			<CheckBox {...args} disabled />
			<CheckBox {...args} disabled checked />
		</View>
	),
};
