import { useSetAtom } from "jotai";
import { useRef, useState } from "react";
import { sessionTokenAtom } from "../../../entities/session";
import { getUserProfile, userAtom } from "../../../entities/user";
import { login } from "../api/login";
import { lastLoginMethodAtom } from "./last-login-method-atom";

import type { LoginFormSchema } from "./login-form-schema";

const loginErrorMessageMap = {
	INVALID_CREDENTIALS: "メールアドレスまたはパスワードが間違っています。",
	CAPTCHA_FAILED: "CAPTCHAが失敗しました。再度お試しください。",
	TOO_MANY_REQUESTS: "リクエストが多すぎます。再度お試しください。",
	VALIDATION_ERROR: "入力に誤りがあります。再度お試しください。",
	NETWORK_ERROR: "通信に失敗しました。再度お試しください。",
	SERVER_ERROR: "サーバーに問題があります。再度お試しください。",
	UNKNOWN_ERROR: "エラーが発生しました。再度お試しください。",
} satisfies Record<string, string>;

export const useLogin = () => {
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

			if (loginResult.isErr) {
				setError(loginErrorMessageMap[loginResult.code]);
				setLoading(false);
				return;
			}

			const { sessionToken } = loginResult.value;

			const userResult = await getUserProfile(sessionToken);

			if (userResult.isErr) {
				// TODO: set log
				setError("ユーザーの取得に失敗しました");
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
