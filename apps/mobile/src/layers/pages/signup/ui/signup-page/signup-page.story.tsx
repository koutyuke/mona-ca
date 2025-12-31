import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { __DEV_AgreementNotice, __DEV_AuthWithSocial } from "../../../../features/auth";
import { PageFrame } from "../../../../widgets/layout";
import { SignupPageUI } from "./signup-page.ui";

const meta: Meta<typeof SignupPageUI> = {
	title: "Pages/Signup/SignupPage",
	component: SignupPageUI,
	decorators: [
		Story => (
			<SafeAreaProvider>
				<PageFrame indicatorStyle="black" className="bg-slate-1">
					<Story />
				</PageFrame>
			</SafeAreaProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof SignupPageUI>;

const createDefaultSlots = () => ({
	AgreementNotice: <__DEV_AgreementNotice.components.UI {...__DEV_AgreementNotice.props.default()} />,
	SignupWithSocial: <__DEV_AuthWithSocial.components.UI {...__DEV_AuthWithSocial.props.default()} />,
});

const createErrorSlots = () => ({
	AgreementNotice: <__DEV_AgreementNotice.components.UI {...__DEV_AgreementNotice.props.default()} />,
	SignupWithSocial: <__DEV_AuthWithSocial.components.UI {...__DEV_AuthWithSocial.props.error()} />,
});

export const Default: Story = {
	render: args => <SignupPageUI {...args} slots={createDefaultSlots()} />,
};

export const WithError: Story = {
	render: args => <SignupPageUI {...args} slots={createErrorSlots()} />,
};
