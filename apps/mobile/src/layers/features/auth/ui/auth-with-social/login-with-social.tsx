import { useLoginWithSocial } from "../../model/use-federated-auth";
import { AuthWithSocialUI } from "./auth-with-social.ui";

import type { JSX } from "react";

export const LoginWithSocial = (): JSX.Element => {
	const {
		pendingProvider,
		error,
		authWithDiscord: loginWithDiscord,
		authWithGoogle: loginWithGoogle,
	} = useLoginWithSocial();

	return (
		<AuthWithSocialUI
			actions={{ onPressDiscord: loginWithDiscord, onPressGoogle: loginWithGoogle }}
			error={error}
			pendingProvider={pendingProvider}
		/>
	);
};
