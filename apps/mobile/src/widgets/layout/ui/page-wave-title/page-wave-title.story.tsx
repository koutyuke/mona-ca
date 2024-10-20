import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { PageWaveTitlePresenter } from "./page-wave-title.presenter";

const meta: Meta<typeof PageWaveTitlePresenter> = {
	component: PageWaveTitlePresenter,
};

export default meta;

type Story = StoryObj<typeof PageWaveTitlePresenter>;

const Template = {
	render: args => (
		<View className="relative w-full bg-slate-5">
			<PageWaveTitlePresenter {...args} />
		</View>
	),
} satisfies Story;

export const Default: Story = {
	args: {
		title: `Title${"\n"}Title`,
		titleLines: 2,
		padding: {
			top: 4,
			right: 16,
			bottom: 8,
			left: 16,
		},
	},
	render: args => {
		const sv = useSharedValue(0);

		return Template.render!({
			...args,
			waveAnimatedStyle: {
				verticalTranslate: sv,
			},
		});
	},
};
