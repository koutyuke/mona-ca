import type { ComponentProps } from "react";
import { AgreementNoticeUI } from "./agreement-notice.ui";

const noop = () => {};

export const __DEV_AgreementNotice = {
	components: {
		UI: AgreementNoticeUI,
	},
	props: {
		default: (): ComponentProps<typeof AgreementNoticeUI> => ({
			actions: {
				onPressPrivacyPolicy: noop,
				onPressTermsOfService: noop,
			},
		}),
	},
};
