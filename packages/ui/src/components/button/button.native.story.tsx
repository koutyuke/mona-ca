import { CommandIcon } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { ChevronLeftIcon } from "../../icons/index.native";
import { Button } from "./button.native";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

const meta: Meta<typeof Button> = {
	title: "Components/Button",
	component: Button,
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

type Story = StoryObj<typeof Button>;

const Template: Story = {
	render: args => (
		<View className="w-full p-4">
			<Button {...args} />
		</View>
	),
};

export const Default: Story = {
	args: {
		color: "red",
		children: "Button",
		size: "md",
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
				<Button {...args} color={color} size={size} variant="filled">
					Button
				</Button>
				<Button {...args} color={color} size={size} variant="outline">
					Button
				</Button>
				<Button {...args} color={color} size={size} variant="light">
					Button
				</Button>
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

export const WithIcon: Story = {
	args: {
		color: "red",
		children: "Button",
		variant: "filled",
		size: "md",
		iconPosition: "left",
	},
	render: args => (
		<View className="flex w-full flex-col gap-4 p-4">
			<Button {...args} icon={CommandIcon} iconSize={20} />
			<Button {...args} icon={ChevronLeftIcon} iconSize={28} />
			<Button {...args} circle icon={CommandIcon} iconSize={16} size="sm" />
			<Button {...args} circle icon={ChevronLeftIcon} iconSize={24} size="sm" />
		</View>
	),
};

export const Loading: Story = {
	render: () => (
		<ScrollView className="w-full">
			<View className="flex w-full flex-col gap-4 px-2 py-4">
				<View className="flex w-full flex-row justify-around">
					<Button color="red" loading size="md" variant="filled">
						Button
					</Button>
					<Button color="red" loading size="md" variant="outline">
						Button
					</Button>
					<Button color="red" loading size="md" variant="light">
						Button
					</Button>
				</View>
				<View className="flex w-full flex-row justify-around">
					<Button color="red" loading size="sm" variant="filled">
						Button
					</Button>
					<Button color="red" loading size="sm" variant="outline">
						Button
					</Button>
					<Button color="red" loading size="sm" variant="light">
						Button
					</Button>
				</View>
			</View>
		</ScrollView>
	),
};

export const VariantsAndDisabled: Story = {
	render: () => (
		<View className="flex flex-row gap-2 p-2">
			{["filled", "light", "outline"].map(variant => (
				<View className="flex flex-col gap-4" key={variant}>
					<Button color="red" size="md" variant={variant as "filled"}>
						Button
					</Button>
					<Button color="gray" size="md" variant={variant as "filled"}>
						Button
					</Button>
					<Button color="red" disabled size="md" variant={variant as "filled"}>
						Button
					</Button>
					<Button color="red" loading size="md" variant={variant as "filled"}>
						Button
					</Button>
				</View>
			))}
		</View>
	),
};
