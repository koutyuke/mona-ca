import { AgreementNotice, SignupWithSocial } from "../../../../features/auth";
import { PageFrame } from "../../../../widgets/layout";
import { SignupPageUI } from "./signup-page.ui";

export const SignupPage = () => {
	return (
		<PageFrame indicatorStyle="black">
			<SignupPageUI
				slots={{
					AgreementNotice: <AgreementNotice />,
					SignupWithSocial: <SignupWithSocial />,
				}}
			/>
		</PageFrame>
	);
};
