import type { Meta, StoryObj } from "@storybook/react";
import { __DEV_AgreementNotice } from "./agreement-notice.dev";
import { AgreementNoticeUI } from "./agreement-notice.ui";

const meta: Meta<typeof AgreementNoticeUI> = {
	title: "Features/Auth/AgreementNotice",
	component: AgreementNoticeUI,
};

export default meta;

type Story = StoryObj<typeof AgreementNoticeUI>;

export const Default: Story = {
	args: __DEV_AgreementNotice.props.default(),
};
