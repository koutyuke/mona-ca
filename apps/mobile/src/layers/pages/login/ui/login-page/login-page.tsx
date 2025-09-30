import { LastLoginMethod } from "../../../../features/auth";
import { AgreementNotice, LoginWithEmail, LoginWithSocial } from "../../../../features/auth";
import { PageFrame } from "../../../../widgets/layout";
import { LoginPageUI } from "./login-page.ui";

export const LoginPage = () => {
	return (
		<PageFrame indicatorStyle="black">
			<LoginPageUI
				slots={{
					AgreementNotice: <AgreementNotice />,
					LastLoginMethod: <LastLoginMethod />,
					LoginWithEmail: <LoginWithEmail />,
					LoginWithSocial: <LoginWithSocial />,
				}}
			/>
		</PageFrame>
	);
};
