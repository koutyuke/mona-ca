import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { Text } from "./text.native";

const meta: Meta<typeof Text> = {
	title: "Components/Text",
	component: Text,
	argTypes: {
		size: {
			options: ["xl", "lg", "md", "sm", "xs", "2xs"],
			control: {
				type: "radio",
			},
		},
		truncated: {
			control: {
				type: "boolean",
			},
		},
		weight: {
			options: ["light", "regular", "medium"],
			control: {
				type: "radio",
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {
	args: {
		size: "xl",
		children: "Hello world",
	},
	render: args => <Text {...args} />,
};

export const AllLevels: Story = {
	args: {
		weight: "regular",
		truncated: true,
	},
	render: args => (
		<View className="flex flex-col gap-2">
			<Text {...args} size="xl" className="text-slate-12">
				我々は宇宙人である。We are aliens.
			</Text>
			<Text {...args} size="lg" className="text-slate-12">
				宇宙人である。We are aliens.
			</Text>
			<Text {...args} size="md" className="text-slate-12">
				宇宙人である。We are aliens.
			</Text>
			<Text {...args} size="sm" className="text-slate-12">
				宇宙人である。We are aliens.
			</Text>
			<Text {...args} size="xs" className="text-slate-12">
				宇宙人である。We are aliens.
			</Text>
			<Text {...args} size="2xs" className="text-slate-12">
				宇宙人である。We are aliens.
			</Text>
		</View>
	),
};

export const Bold: Story = {
	render: () => (
		<View className="flex flex-col gap-2 ">
			<Text size="xl" className="text-slate-12">
				Page Title
			</Text>
			<Text size="lg" className="text-slate-12">
				Section Title
			</Text>
			<Text size="md" className="text-slate-12">
				Body
			</Text>
			<Text size="sm" className="text-slate-12">
				Secondary Text
			</Text>
			<Text size="xs" className="text-slate-12">
				Footnote
			</Text>
		</View>
	),
};

export const Truncated: Story = {
	args: {
		children: "Hello world this is a very long text that should be truncated",
		truncated: true,
	},
	render: args => <Text {...args} />,
};

export const Multiline: Story = {
	args: {
		size: "md",
		className: "text-slate-12",
		weight: "regular",
	},
	render: args => (
		<View className="flex flex-col gap-2">
			<Text {...args}>
				このアプリでは、ユーザーが自分のスケジュールやタスクを簡単に管理できるよう設計されています。直感的なインターフェースと柔軟なカスタマイズ性により、日常のあらゆるシーンでご活用いただけます。複数デバイス間の同期にも対応しており、外出先からでも安心してご利用いただけます。
			</Text>
			<Text {...args}>
				Our platform provides a seamless and intuitive experience for managing your daily tasks and schedules. With
				real-time syncing and customizable views, you can stay organized whether you're working from home or on the go.
				Designed for all users in mind, it adapts to your workflow and supports your productivity every step of the way.
			</Text>
		</View>
	),
};
