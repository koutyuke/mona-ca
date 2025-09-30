import type { Meta, StoryObj } from "@storybook/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
	__DEV_AgreementNotice,
	__DEV_LastLoginMethod,
	__DEV_LoginWithEmail,
	__DEV_LoginWithSocial,
} from "../../../../features/auth";
import { PageFrame } from "../../../../widgets/layout";
import { LoginPageUI } from "./login-page.ui";

const meta: Meta<typeof LoginPageUI> = {
	title: "Pages/Login/LoginPage",
	component: LoginPageUI,
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

type Story = StoryObj<typeof LoginPageUI>;

const createDefaultSlots = () => ({
	AgreementNotice: <__DEV_AgreementNotice.components.UI {...__DEV_AgreementNotice.props.default()} />,
	LastLoginMethod: <__DEV_LastLoginMethod.components.UI {...__DEV_LastLoginMethod.props.withMethod()} />,
	LoginWithEmail: <__DEV_LoginWithEmail.components.UI {...__DEV_LoginWithEmail.props.default()} />,
	LoginWithSocial: <__DEV_LoginWithSocial.components.UI {...__DEV_LoginWithSocial.props.default()} />,
});

export const Default: Story = {
	render: args => <LoginPageUI {...args} slots={createDefaultSlots()} />,
};

export const WithError: Story = {
	render: args => <LoginPageUI {...args} slots={createDefaultSlots()} />,
};
