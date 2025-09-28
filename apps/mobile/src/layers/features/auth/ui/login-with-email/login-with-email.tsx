import { useLoginWithEmail } from "../../model/use-login-with-email";
import { TurnstileFormUI } from "../turnstile/turnstile-form.ui";
import { TurnstileModalUI } from "../turnstile/turnstile-modal.ui";
import { LoginWithEmailUI } from "./login-with-email.ui";

type Props = {
	onError: (errorMessage: string | null) => void;
};

export const LoginWithEmail = ({ onError }: Props) => {
	const {
		isTurnstileModalClosable,
		isTurnstileModalVisible,
		isLoading,
		startTurnstileVerification,
		completeTurnstileVerification,
		closeTurnstileModal,
	} = useLoginWithEmail({ onError });

	return (
		<LoginWithEmailUI
			loading={isLoading}
			actions={{ onSubmit: startTurnstileVerification }}
			slots={{
				Turnstile: (
					<TurnstileModalUI
						isVisible={isTurnstileModalVisible}
						isClosable={isTurnstileModalClosable}
						actions={{ onClose: closeTurnstileModal }}
						slots={{
							TurnstileForm: (
								<TurnstileFormUI
									sitekey={process.env.EXPO_PUBLIC_TURNSTILE_SITEKEY!}
									onVerify={completeTurnstileVerification}
								/>
							),
						}}
					/>
				),
			}}
		/>
	);
};
