import { isErr } from "@mona-ca/core/utils";
import { useSetAtom } from "jotai";
import { useRef, useState } from "react";
import { sessionTokenAtom } from "../../../entities/session";
import { getMe, userAtom } from "../../../entities/user";
import { signup } from "../api/signup-with-email";
import { lastLoginMethodAtom } from "./last-login-method-atom";
import type { SignupFormSchema } from "./signup-form-schema";

export const useSignupWithEmail = () => {
	const setSessionToken = useSetAtom(sessionTokenAtom);
	const setLastLoginMethod = useSetAtom(lastLoginMethodAtom);
	const setUser = useSetAtom(userAtom);

	const [isTurnstileModalClosable, setTurnstileModalClosable] = useState<boolean>(true);
	const [isTurnstileModalVisible, setTurnstileModalVisible] = useState(false);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const formData = useRef<SignupFormSchema | null>(null);

	const startTurnstileVerification = (data: SignupFormSchema) => {
		formData.current = data;
		setTurnstileModalVisible(true);
		setLoading(true);
	};

	const completeTurnstileVerification = async (turnstileToken: string) => {
		setTurnstileModalClosable(false);

		setTimeout(async () => {
			setTurnstileModalVisible(false);
			setTurnstileModalClosable(true);

			if (!formData.current || !isTurnstileModalVisible) return;

			const { email, password, name, gender } = formData.current;

			const signupResult = await signup(email, password, name, gender, turnstileToken);

			if (isErr(signupResult)) {
				setError(signupResult.value.errorMessage);
				setLoading(false);
				return;
			}

			const { sessionToken } = signupResult.value;

			const userResult = await getMe(sessionToken);

			if (isErr(userResult)) {
				setError(userResult.value.errorMessage);
				setLoading(false);
				return;
			}

			setSessionToken(sessionToken);
			setUser({ type: "set", payload: userResult.value });
			setLastLoginMethod("email");

			setLoading(false);
		}, 1000);
	};

	const closeTurnstileModal = () => {
		if (isTurnstileModalClosable) {
			setLoading(false);
			setTurnstileModalClosable(false);
			setTurnstileModalVisible(false);
			formData.current = null;
		}
	};

	return {
		isTurnstileModalClosable,
		isTurnstileModalVisible,
		isLoading,
		error,

		startTurnstileVerification,
		completeTurnstileVerification,
		closeTurnstileModal,
	};
};
