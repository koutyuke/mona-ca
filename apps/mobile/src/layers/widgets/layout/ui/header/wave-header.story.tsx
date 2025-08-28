import type { Meta, StoryObj } from "@storybook/react";
import { WaveHeader } from "./wave-header";

const meta: Meta<typeof WaveHeader> = {
	title: "Widgets/Layout/Header/WaveHeader",
	component: WaveHeader,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: "WaveHeader",
		subTitle: "WaveHeader",
		enableBackButton: true,
		backButtonLabel: "Back",
	},
};
