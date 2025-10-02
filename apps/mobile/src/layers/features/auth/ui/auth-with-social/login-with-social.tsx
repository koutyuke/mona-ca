import type { JSX } from "react";
import { useLoginWithSocial } from "../../model/use-login-with-social";
import { AuthWithSocialUI } from "./auth-with-social.ui";

export const LoginWithSocial = (): JSX.Element => {
	const { pendingProvider, error, loginWithDiscord, loginWithGoogle } = useLoginWithSocial();

	return (
		<AuthWithSocialUI
			pendingProvider={pendingProvider}
			error={error}
			actions={{ onPressDiscord: loginWithDiscord, onPressGoogle: loginWithGoogle }}
		/>
	);
};
