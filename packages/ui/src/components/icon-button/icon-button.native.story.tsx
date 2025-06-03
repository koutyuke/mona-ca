import type { Meta, StoryObj } from "@storybook/react";
import { ScrollView, View } from "react-native";
import { EmailIcon } from "../../icons/index.native";
import { IconButton } from "./icon-button.native";

const meta: Meta<typeof IconButton> = {
	title: "components/IconButton",
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
		}: { size: "md" | "sm"; color: "red" | "blue" | "green" | "yellow" | "salmon" | "gray" }) => (
			<View className="flex w-full flex-row justify-around">
				<IconButton {...args} size={size} variant="filled" color={color} />
				<IconButton {...args} size={size} variant="outline" color={color} />
				<IconButton {...args} size={size} variant="light" color={color} />
			</View>
		);

		return (
			<ScrollView className="w-full">
				<View className="flex w-full flex-col gap-4 px-2 py-4">
					<FullVariant size="md" color="red" />
					<FullVariant size="md" color="blue" />
					<FullVariant size="md" color="green" />
					<FullVariant size="md" color="yellow" />
					<FullVariant size="md" color="salmon" />
					<FullVariant size="md" color="gray" />
					<FullVariant size="sm" color="red" />
					<FullVariant size="sm" color="blue" />
					<FullVariant size="sm" color="green" />
					<FullVariant size="sm" color="yellow" />
					<FullVariant size="sm" color="salmon" />
					<FullVariant size="sm" color="gray" />
				</View>
			</ScrollView>
		);
	},
};
