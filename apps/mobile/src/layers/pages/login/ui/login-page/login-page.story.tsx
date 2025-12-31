import { SafeAreaProvider } from "react-native-safe-area-context";
import {
	__DEV_AgreementNotice,
	__DEV_AuthWithSocial,
	__DEV_LastLoginMethod,
	__DEV_LoginWithEmail,
} from "../../../../features/auth";
import { PageFrame } from "../../../../widgets/layout";
import { LoginPageUI } from "./login-page.ui";

import type { Meta, StoryObj } from "@storybook/react-webpack5";

const meta: Meta<typeof LoginPageUI> = {
	title: "Pages/Login/LoginPage",
	component: LoginPageUI,
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

type Story = StoryObj<typeof LoginPageUI>;

const createDefaultSlots = () => ({
	AgreementNotice: <__DEV_AgreementNotice.components.UI {...__DEV_AgreementNotice.props.default()} />,
	LastLoginMethod: <__DEV_LastLoginMethod.components.UI {...__DEV_LastLoginMethod.props.withMethod()} />,
	LoginWithEmail: <__DEV_LoginWithEmail.components.UI {...__DEV_LoginWithEmail.props.default()} />,
	LoginWithSocial: <__DEV_AuthWithSocial.components.UI {...__DEV_AuthWithSocial.props.default()} />,
});

const createErrorSlots = () => ({
	AgreementNotice: <__DEV_AgreementNotice.components.UI {...__DEV_AgreementNotice.props.default()} />,
	LastLoginMethod: <__DEV_LastLoginMethod.components.UI {...__DEV_LastLoginMethod.props.withMethod()} />,
	LoginWithEmail: <__DEV_LoginWithEmail.components.UI {...__DEV_LoginWithEmail.props.error()} />,
	LoginWithSocial: <__DEV_AuthWithSocial.components.UI {...__DEV_AuthWithSocial.props.error()} />,
});
export const Default: Story = {
	render: args => <LoginPageUI {...args} slots={createDefaultSlots()} />,
};

export const WithError: Story = {
	render: args => <LoginPageUI {...args} slots={createErrorSlots()} />,
};
