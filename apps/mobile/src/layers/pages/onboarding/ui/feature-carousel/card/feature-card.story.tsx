import { View } from "react-native";
import { FeatureCardUI } from "./feature-card.ui";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

const meta: Meta<typeof FeatureCardUI> = {
	title: "Pages/Onboarding/FeatureCard",
	component: FeatureCardUI,
	render: args => (
		<View className="h-full w-full p-4">
			<FeatureCardUI {...args} />
		</View>
	),
};

export default meta;

type Story = StoryObj<typeof FeatureCardUI>;

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
