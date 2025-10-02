import { useSignupWithEmail } from "../../model/use-signup-with-email";
import { TurnstileFormUI } from "../turnstile/turnstile-form.ui";
import { TurnstileModalUI } from "../turnstile/turnstile-modal.ui";
import { SignupWithEmailUI } from "./signup-with-email.ui";

export const SignupWithEmail = () => {
	const {
		isTurnstileModalClosable,
		isTurnstileModalVisible,
		isLoading,
		error,
		startTurnstileVerification,
		completeTurnstileVerification,
		closeTurnstileModal,
	} = useSignupWithEmail();

	return (
		<SignupWithEmailUI
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
