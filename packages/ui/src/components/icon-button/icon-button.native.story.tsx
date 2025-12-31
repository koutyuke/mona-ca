import { ScrollView, View } from "react-native";
import { EmailIcon } from "../../icons/index.native";
import { IconButton } from "./icon-button.native";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

const meta: Meta<typeof IconButton> = {
	title: "Components/IconButton",
	component: IconButton,
	argTypes: {
		color: {
			options: ["red", "blue", "green", "yellow", "salmon", "gray"],
			control: {
				type: "radio",
			},
		},
		size: {
			options: ["sm", "md"],
			control: {
				type: "radio",
			},
		},
		variant: {
			options: ["outline", "light", "filled"],
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
	},
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
	args: {
		color: "blue",
		icon: EmailIcon,
	},
	render: args => {
		const FullVariant = ({
			size,
			color,
		}: {
			size: "md" | "sm";
			color: "red" | "blue" | "green" | "yellow" | "salmon" | "gray";
		}) => (
			<View className="flex w-full flex-row justify-around">
				<IconButton {...args} color={color} size={size} variant="filled" />
				<IconButton {...args} color={color} size={size} variant="outline" />
				<IconButton {...args} color={color} size={size} variant="light" />
			</View>
		);

		return (
			<ScrollView className="w-full">
				<View className="flex w-full flex-col gap-4 px-2 py-4">
					<FullVariant color="red" size="md" />
					<FullVariant color="blue" size="md" />
					<FullVariant color="green" size="md" />
					<FullVariant color="yellow" size="md" />
					<FullVariant color="salmon" size="md" />
					<FullVariant color="gray" size="md" />
					<FullVariant color="red" size="sm" />
					<FullVariant color="blue" size="sm" />
					<FullVariant color="green" size="sm" />
					<FullVariant color="yellow" size="sm" />
					<FullVariant color="salmon" size="sm" />
					<FullVariant color="gray" size="sm" />
				</View>
			</ScrollView>
		);
	},
};
