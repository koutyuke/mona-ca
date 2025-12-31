import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { FeatureCarouselUI } from "./feature-carousel.ui";

const meta: Meta<typeof FeatureCarouselUI> = {
	title: "Pages/Onboarding/FeatureCarousel",
	component: FeatureCarouselUI,
};

export default meta;

type Story = StoryObj<typeof FeatureCarouselUI>;

export const Default: Story = {};
