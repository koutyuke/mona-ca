import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { EmailIcon } from "../../icons/index.native";
import { TextInput } from "./text-input.native";

const meta: Meta<typeof TextInput> = {
	title: "Components/TextInput",
	component: TextInput,
	argTypes: {
		size: {
			options: ["sm", "md"],
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
		error: {
			control: {
				type: "boolean",
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
	args: {
		placeholder: "Enter your email",
		icon: EmailIcon,
	},
	render: args => (
		<View className="flex w-full flex-col gap-4 p-4">
			<TextInput value="我々は宇宙人である。 I am an alien." size="md" />
			<TextInput value="我々は宇宙人である。 I am an alien." size="sm" />
			<TextInput {...args} value="我々は宇宙人である。 I am an alien." size="md" />
			<TextInput {...args} value="我々は宇宙人である。 I am an alien." size="md" error />
			<TextInput {...args} value="我々は宇宙人である。 I am an alien." size="md" disabled />
			<TextInput {...args} value="我々は宇宙人である。 I am an alien." size="md" credentials />
			<TextInput {...args} value="我々は宇宙人である。 I am an alien." size="sm" />
		</View>
	),
};
