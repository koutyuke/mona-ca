import { AgreementNotice, SignupWithEmail } from "../../../../features/auth";
import { PageFrame } from "../../../../widgets/layout";
import { SignupWithEmailPageUI } from "./signup-with-email-page.ui";

export const SignupWithEmailPage = () => {
	return (
		<PageFrame indicatorStyle="black">
			<SignupWithEmailPageUI slots={{ AgreementNotice: <AgreementNotice />, SignupWithEmail: <SignupWithEmail /> }} />
		</PageFrame>
	);
};
