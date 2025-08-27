import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import { OnboardingCard } from "./card";

const meta: Meta<typeof OnboardingCard> = {
	title: "Pages/Onboarding/Card",
	component: OnboardingCard,
	render: args => (
		<View className="h-full w-full p-4">
			<OnboardingCard {...args} />
		</View>
	),
};

export default meta;

type Story = StoryObj<typeof OnboardingCard>;

export const MonaCa: Story = {
	args: {
		variant: "mona-ca",
		className: "w-[80%]",
	},
};

export const Customize: Story = {
	args: {
		variant: "customize",
		className: "w-[80%]",
	},
};

export const Share: Story = {
	args: {
		variant: "share",
		className: "w-[80%]",
	},
};
