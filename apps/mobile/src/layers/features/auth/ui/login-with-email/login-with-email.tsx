import { useLogin } from "../../model/use-login";
import { TurnstileFormUI } from "../turnstile/turnstile-form.ui";
import { TurnstileModalUI } from "../turnstile/turnstile-modal.ui";
import { LoginWithEmailUI } from "./login-with-email.ui";

export const LoginWithEmail = () => {
	const {
		isTurnstileModalClosable,
		isTurnstileModalVisible,
		isLoading,
		error,
		startTurnstileVerification,
		completeTurnstileVerification,
		closeTurnstileModal,
	} = useLogin();

	return (
		<LoginWithEmailUI
			loading={isLoading}
			error={error}
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
