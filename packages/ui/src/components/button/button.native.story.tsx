import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { CommandIcon } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { ChevronLeftIcon } from "../../icons/index.native";
import { Button } from "./button.native";

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
		}: { size: "md" | "sm"; color: "red" | "blue" | "green" | "yellow" | "salmon" | "gray" }) => (
			<View className="flex w-full flex-row justify-around">
				<Button {...args} size={size} variant="filled" color={color}>
					Button
				</Button>
				<Button {...args} size={size} variant="outline" color={color}>
					Button
				</Button>
				<Button {...args} size={size} variant="light" color={color}>
					Button
				</Button>
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
			<Button {...args} circle size="sm" icon={CommandIcon} iconSize={16} />
			<Button {...args} circle size="sm" icon={ChevronLeftIcon} iconSize={24} />
		</View>
	),
};

export const Loading: Story = {
	render: () => (
		<ScrollView className="w-full">
			<View className="flex w-full flex-col gap-4 px-2 py-4">
				<View className="flex w-full flex-row justify-around">
					<Button size="md" variant="filled" color="red" loading>
						Button
					</Button>
					<Button size="md" variant="outline" color="red" loading>
						Button
					</Button>
					<Button size="md" variant="light" color="red" loading>
						Button
					</Button>
				</View>
				<View className="flex w-full flex-row justify-around">
					<Button size="sm" variant="filled" color="red" loading>
						Button
					</Button>
					<Button size="sm" variant="outline" color="red" loading>
						Button
					</Button>
					<Button size="sm" variant="light" color="red" loading>
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
					<Button size="md" variant={variant as "filled"} color="red">
						Button
					</Button>
					<Button size="md" variant={variant as "filled"} color="gray">
						Button
					</Button>
					<Button size="md" variant={variant as "filled"} color="red" disabled>
						Button
					</Button>
					<Button size="md" variant={variant as "filled"} color="red" loading>
						Button
					</Button>
				</View>
			))}
		</View>
	),
};
