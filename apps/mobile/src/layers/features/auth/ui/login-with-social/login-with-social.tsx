import type { FC } from "react";
import { useLoginWithSocial } from "../../model/use-login-with-social";
import { LoginWithSocialUI } from "./login-with-social.ui";

type Props = {
	onError: (errorMessage: string) => void;
};

export const LoginWithSocial: FC<Props> = ({ onError }) => {
	const { pendingProvider, loginWithDiscord, loginWithGoogle } = useLoginWithSocial({ onError });

	return (
		<LoginWithSocialUI
			pendingProvider={pendingProvider}
			actions={{ onPressDiscord: loginWithDiscord, onPressGoogle: loginWithGoogle }}
		/>
	);
};
