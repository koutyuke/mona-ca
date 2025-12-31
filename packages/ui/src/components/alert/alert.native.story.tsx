import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { ScrollView, View } from "react-native";
import { Alert } from "./alert.native";

const meta: Meta<typeof Alert> = {
	title: "Components/Alert",
	component: Alert,
	argTypes: {
		type: {
			options: ["info", "success", "warning", "error"],
			control: {
				type: "radio",
			},
		},
		title: {
			control: {
				type: "text",
			},
		},
		description: {
			control: {
				type: "text",
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
	args: {
		title: "寿限無",
		description:
			"寿限無 寿限無 五劫のすり切れ 海砂利水魚の 水行末、雲来末、風来末 食う寝るところに住むところ やぶらこうじのぶらこうじ パイポパイポパイポのシューリンガン シューリンガンのグーリンダイ グーリンダイのポンポコピーのポンポコナーの長久命の長助",
	},
	render: args => (
		<ScrollView className="w-full">
			<View className="flex w-full flex-col gap-4 p-4">
				<Alert {...args} type="info" />
				<Alert {...args} type="success" />
				<Alert {...args} type="warning" />
				<Alert {...args} type="error" />
			</View>
		</ScrollView>
	),
};

export const TitleOnly: Story = {
	args: {
		title: "われわれは宇宙人だ",
	},
	render: args => (
		<ScrollView className="w-full">
			<View className="flex w-full flex-col gap-4 p-4">
				<Alert {...args} type="info" />
				<Alert {...args} type="success" />
				<Alert {...args} type="warning" />
				<Alert {...args} type="error" />
			</View>
		</ScrollView>
	),
};

export const MultipleLineTitle: Story = {
	args: {
		title:
			"クルンテープ・マハーナコーン・アモーンラッタナコーシン・マヒンタラーユッタヤー・マハーディロック・ポップ・ノッパラット・ラーチャターニーブリーロム・ウドムラーチャニウェートマハーサターン・アモーンピマーン・アワターンサティット・サッカタッティヤウィッサヌカムプラシット",
		description: "タイの首都・バンコクの正式名称",
	},
	render: args => (
		<ScrollView className="w-full">
			<View className="flex w-full flex-col gap-4 p-4">
				<Alert {...args} type="info" />
				<Alert {...args} type="success" />
				<Alert {...args} type="warning" />
				<Alert {...args} type="error" />
			</View>
		</ScrollView>
	),
};
