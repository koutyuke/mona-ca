import type { JSX } from "react";
import { useSignupWithSocial } from "../../model/use-signup-with-social";
import { AuthWithSocialUI } from "./auth-with-social.ui";

export const SignupWithSocial = (): JSX.Element => {
	const { pendingProvider, error, signupWithDiscord, signupWithGoogle } = useSignupWithSocial();

	return (
		<AuthWithSocialUI
			pendingProvider={pendingProvider}
			error={error}
			actions={{ onPressDiscord: signupWithDiscord, onPressGoogle: signupWithGoogle }}
		/>
	);
};
