import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { ArrowIcon } from "../../icons/index.native";
import { Button } from "./button.native";

const meta: Meta<typeof Button> = {
	component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

const Template: Story = {
	render: args => (
		<View className="w-full p-4">
			<Button {...args} />
		</View>
	),
	argTypes: {
		color: {
			options: ["red", "blue", "green", "yellow", "salmon", "gray"],
			control: {
				type: "radio",
			},
		},
		size: {
			options: ["sm", "md", "lg"],
			control: {
				type: "radio",
			},
		},
		variant: {
			options: ["outline", "light", "filled", "ghost"],
			control: {
				type: "radio",
			},
		},
		circle: {
			control: {
				type: "boolean",
			},
		},
		bold: {
			control: {
				type: "boolean",
			},
		},
		loading: {
			control: {
				type: "boolean",
			},
		},
		disabled: {
			control: {
				type: "boolean",
			},
		},
		elevated: {
			control: {
				type: "boolean",
			},
		},
		fullWidth: {
			control: {
				type: "boolean",
			},
		},
	},
};

export const Default: Story = {
	args: {
		color: "red",
		children: "Button",
	},
	...Template,
};

export const Outline: Story = {
	args: {
		color: "blue",
		children: "Button",
		variant: "outline",
		size: "md",
	},
	...Template,
};

export const Light: Story = {
	args: {
		color: "green",
		children: "Button",
		variant: "light",
		size: "md",
	},
	...Template,
};

export const Filled: Story = {
	args: {
		color: "yellow",
		children: "Button",
		variant: "filled",
		size: "md",
	},
	...Template,
};

export const Ghost: Story = {
	args: {
		color: "salmon",
		children: "Button",
		variant: "ghost",
		size: "md",
	},
	...Template,
};

export const FullWidth: Story = {
	args: {
		color: "red",
		children: "Button",
		variant: "filled",
		size: "md",
		fullWidth: true,
	},
	...Template,
};

export const WithIcon: Story = {
	args: {
		color: "red",
		children: "Button",
		variant: "filled",
		size: "md",
		leftIcon: ArrowIcon,
		rightIcon: ArrowIcon,
	},
	...Template,
};
