import { SafeAreaProvider } from "react-native-safe-area-context";
import { PageFrame } from "../../../../widgets/layout";
import { OnboardingPageUI } from "./onboarding-page.ui";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

const meta: Meta<typeof OnboardingPageUI> = {
	title: "Pages/Onboarding/OnboardingPage",
	component: OnboardingPageUI,
	decorators: [
		Story => (
			<SafeAreaProvider>
				<PageFrame className="bg-slate-1" indicatorStyle="black">
					<Story />
				</PageFrame>
			</SafeAreaProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof OnboardingPageUI>;

export const Default: Story = {};
