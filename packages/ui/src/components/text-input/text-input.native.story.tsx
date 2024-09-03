import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { EmailIcon } from "../../icons/index.native";
import { TextInput } from "./text-input.native";

const meta: Meta<typeof TextInput> = {
	component: TextInput,
};

export default meta;

type Story = StoryObj<typeof TextInput>;

const Template: Story = {
	render: args => (
		<View className="w-full p-4">
			<TextInput {...args} />
		</View>
	),
	argTypes: {
		size: {
			options: ["sm", "md", "lg"],
			control: {
				type: "radio",
			},
		},
		placeholder: {
			control: {
				type: "text",
			},
		},
		disabled: {
			control: {
				type: "boolean",
			},
		},
		credentials: {
			control: {
				type: "boolean",
			},
		},
		elevated: {
			control: {
				type: "boolean",
			},
		},
		readOnly: {
			control: {
				type: "boolean",
			},
		},
		error: {
			control: {
				type: "boolean",
			},
		},
	},
};

export const Default: Story = {
	args: {
		placeholder: "Enter your email",
		icon: EmailIcon,
	},
	...Template,
};
