import { AgreementNoticeUI } from "./agreement-notice.ui";

export const AgreementNotice = () => {
	// TODO: implement onPressPrivacyPolicy and onPressTermsOfService
	return (
		<AgreementNoticeUI
			actions={{
				onPressPrivacyPolicy: () => {},
				onPressTermsOfService: () => {},
			}}
		/>
	);
};
