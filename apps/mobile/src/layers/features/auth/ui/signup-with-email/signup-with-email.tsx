import { useSignup } from "../../model/use-signup";
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
	} = useSignup();

	return (
		<SignupWithEmailUI
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
