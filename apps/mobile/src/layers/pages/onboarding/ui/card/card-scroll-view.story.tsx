import type { Meta, StoryObj } from "@storybook/react";
import { OnboardingCardScrollView } from "./card-scroll-view";

const meta: Meta<typeof OnboardingCardScrollView> = {
	title: "Pages/Onboarding/CardScrollView",
	component: OnboardingCardScrollView,
};

export default meta;

type Story = StoryObj<typeof OnboardingCardScrollView>;

export const Default: Story = {};
