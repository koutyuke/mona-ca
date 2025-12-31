import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { __DEV_AgreementNotice, __DEV_SignupWithEmail } from "../../../../features/auth";
import { PageFrame } from "../../../../widgets/layout";
import { SignupWithEmailPageUI } from "./signup-with-email-page.ui";

const meta: Meta<typeof SignupWithEmailPageUI> = {
	title: "Pages/Signup/SignupWithEmailPage",
	component: SignupWithEmailPageUI,
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

type Story = StoryObj<typeof SignupWithEmailPageUI>;

const createDefaultSlots = () => ({
	AgreementNotice: <__DEV_AgreementNotice.components.UI {...__DEV_AgreementNotice.props.default()} />,
	SignupWithEmail: <__DEV_SignupWithEmail.components.UI {...__DEV_SignupWithEmail.props.default()} />,
});

const createErrorSlots = () => ({
	AgreementNotice: <__DEV_AgreementNotice.components.UI {...__DEV_AgreementNotice.props.default()} />,
	SignupWithEmail: <__DEV_SignupWithEmail.components.UI {...__DEV_SignupWithEmail.props.error()} />,
});

export const Default: Story = {
	render: args => <SignupWithEmailPageUI {...args} slots={createDefaultSlots()} />,
};

export const WithError: Story = {
	render: args => <SignupWithEmailPageUI {...args} slots={createErrorSlots()} />,
};
