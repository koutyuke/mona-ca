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
			actions={{ onSubmit: startTurnstileVerification }}
			error={error}
			loading={isLoading}
			slots={{
				Turnstile: (
					<TurnstileModalUI
						actions={{ onClose: closeTurnstileModal }}
						isClosable={isTurnstileModalClosable}
						isVisible={isTurnstileModalVisible}
						slots={{
							TurnstileForm: (
								<TurnstileFormUI
									onVerify={completeTurnstileVerification}
									sitekey={process.env.EXPO_PUBLIC_TURNSTILE_SITEKEY!}
								/>
							),
						}}
					/>
				),
			}}
		/>
	);
};
