import { View } from "react-native";
import { EmailIcon } from "../../icons/index.native";
import { TextInput } from "./text-input.native";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

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
			<TextInput size="md" value="我々は宇宙人である。 I am an ninja." />
			<TextInput size="sm" value="我々は宇宙人である。 I am an ninja." />
			<TextInput {...args} size="md" value="我々は宇宙人である。 I am an ninja." />
			<TextInput {...args} error size="md" value="我々は宇宙人である。 I am an ninja." />
			<TextInput {...args} disabled size="md" value="我々は宇宙人である。 I am an ninja." />
			<TextInput {...args} credentials size="md" value="我々は宇宙人である。 I am an ninja." />
			<TextInput {...args} size="sm" value="我々は宇宙人である。 I am an ninja." />
		</View>
	),
};
