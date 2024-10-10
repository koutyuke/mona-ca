import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { HeaderPresenter } from "./header.presenter";

const meta: Meta<typeof HeaderPresenter> = {
	component: HeaderPresenter,
};

export default meta;

type Story = StoryObj<typeof HeaderPresenter>;

const Template: Story = {
	render: args => (
		<View className="relative h-full w-full">
			<View className="absolute top-0 left-0 z-10">
				<HeaderPresenter {...args} />
			</View>
			<ScrollView className="flex h-full w-full pt-14">
				<View className="flex h-96 w-full items-center justify-center bg-slate-4">
					<Text className="text-center font-bold text-4xl text-slate-12">Content</Text>
				</View>
				<View className="flex h-96 w-full items-center justify-center bg-slate-5">
					<Text className="text-center font-bold text-4xl text-slate-12">Content</Text>
				</View>
				<View className="flex h-96 w-full items-center justify-center bg-slate-6">
					<Text className="text-center font-bold text-4xl text-slate-12">Content</Text>
				</View>
				<View className="flex h-96 w-full items-center justify-center bg-slate-7">
					<Text className="text-center font-bold text-4xl text-slate-12">Content</Text>
				</View>
				<View className="flex h-96 w-full items-center justify-center bg-slate-8">
					<Text className="text-center font-bold text-4xl text-slate-12">Content</Text>
				</View>
				<View className="flex h-96 w-full items-center justify-center bg-slate-9">
					<Text className="text-center font-bold text-4xl text-slate-12">Content</Text>
				</View>
			</ScrollView>
		</View>
	),
};

export const Default: Story = {
	args: {
		unsafeAreaSpace: {
			top: 0,
			right: 16,
			bottom: 0,
			left: 16,
		},
		title: "Title",
		subTitle: "Sub Title",
	},
	...Template,
};

export const Color: Story = {
	args: {
		unsafeAreaSpace: {
			top: 0,
			right: 16,
			bottom: 0,
			left: 16,
		},
		title: "Title",
		subTitle: "Sub Title",
		titleColorClassName: "color-salmon-1",
		backButtonColorClassName: "color-salmon-1 group-active:color-salmon-4",
		headerClassName: "bg-salmon-9",
	},
	...Template,
};

export const TitleOpacityAnimation: Story = {
	args: {
		unsafeAreaSpace: {
			top: 0,
			right: 16,
			bottom: 0,
			left: 16,
		},
		title: "Title",
		subTitle: "Sub Title",
	},
	render: args => {
		const sv = useSharedValue<number>(0);

		// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
		useEffect(() => {
			sv.value = withRepeat(withTiming(1, { duration: 1000 }), -1, false);
		}, []);

		return (
			<View className="relative h-full w-full">
				<View className="absolute top-0 left-0 z-10">
					<HeaderPresenter
						{...args}
						titleAnimatedStyle={{
							opacity: sv,
						}}
					/>
				</View>
			</View>
		);
	},
};
