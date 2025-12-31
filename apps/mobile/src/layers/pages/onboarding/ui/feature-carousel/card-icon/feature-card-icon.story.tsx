import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { FeatureCardIconUI } from "./feature-card-icon.ui";

const meta: Meta<typeof FeatureCardIconUI> = {
	title: "Pages/Onboarding/FeatureCardIcon",
	component: FeatureCardIconUI,
	args: {
		variant: "customize",
	},
};

export default meta;

type Story = StoryObj<typeof FeatureCardIconUI>;

export const Widget: Story = {
	args: {
		variant: "customize",
	},
};

export const Share: Story = {
	args: {
		variant: "share",
	},
};

export const MonaCa: Story = {
	args: {
		variant: "mona-ca",
	},
};
