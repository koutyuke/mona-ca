import { LastLoginMethod } from "../../../../features/auth";
import { AgreementNotice, LoginWithEmail, LoginWithSocial } from "../../../../features/auth";
import { PageFrame } from "../../../../widgets/layout";
import { useLoginPage } from "../../models/use-login-page";
import { LoginPageUI } from "./login-page.ui";

export const LoginPage = () => {
	const { errorMessage, setErrorMessage } = useLoginPage();

	return (
		<PageFrame indicatorStyle="black">
			<LoginPageUI
				errorMessage={errorMessage}
				slots={{
					AgreementNotice: <AgreementNotice />,
					LastLoginMethod: <LastLoginMethod />,
					LoginWithEmail: <LoginWithEmail onError={setErrorMessage} />,
					LoginWithSocial: <LoginWithSocial onError={setErrorMessage} />,
				}}
			/>
		</PageFrame>
	);
};
