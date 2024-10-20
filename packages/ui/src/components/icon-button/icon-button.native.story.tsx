import type { Meta, StoryObj } from "@storybook/react";
import { EmailIcon } from "../../icons/index.native";
import { IconButton } from "./icon-button.native";

const meta: Meta<typeof IconButton> = {
	component: IconButton,
};

export default meta;

type Story = StoryObj<typeof IconButton>;

const Template: Story = {
	render: args => <IconButton {...args} />,
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
		fullWidth: {
			control: {
				type: "boolean",
			},
		},
	},
};

export const Default: Story = {
	args: {
		color: "blue",
		icon: EmailIcon,
	},
	...Template,
};
