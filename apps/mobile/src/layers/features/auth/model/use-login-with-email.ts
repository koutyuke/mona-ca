import { isErr } from "@mona-ca/core/utils";
import { useSetAtom } from "jotai";
import { useRef, useState } from "react";
import { sessionTokenAtom } from "../../../entities/session";
import { getMe, userAtom } from "../../../entities/user";
import { login } from "../api/login-with-email";
import type { LoginFormSchema } from "../model/login-form-schema";
import { lastLoginMethodAtom } from "./last-login-method-atom";

export const useLoginWithEmail = () => {
	const setSessionToken = useSetAtom(sessionTokenAtom);
	const setLastLoginMethod = useSetAtom(lastLoginMethodAtom);
	const setUser = useSetAtom(userAtom);

	const [isTurnstileModalClosable, setTurnstileModalClosable] = useState<boolean>(true);
	const [isTurnstileModalVisible, setTurnstileModalVisible] = useState(false);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const formData = useRef<LoginFormSchema | null>(null);

	const startTurnstileVerification = (data: LoginFormSchema) => {
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

			const { email, password } = formData.current;

			const loginResult = await login(email, password, turnstileToken);

			if (isErr(loginResult)) {
				setError(loginResult.value.errorMessage);
				setLoading(false);
				return;
			}

			const { sessionToken } = loginResult.value;

			const userResult = await getMe(sessionToken);

			if (isErr(userResult)) {
				// TODO: set log
				setError("ユーザーの取得に失敗しました");
				setLoading(false);
				return;
			}

			setSessionToken(sessionToken);
			setUser({ type: "update", payload: userResult.value });
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
