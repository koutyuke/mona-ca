import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { accountLinkTokenAtom, sessionTokenAtom } from "../../../entities/session";
import { federatedAuth } from "../api/federated-auth";
import { lastLoginMethodAtom } from "./last-login-method-atom";

import type { SupportProvider } from "./support-provider";

const errorMessageMap = {
	ACCESS_DENIED: "アクセスが拒否されました。",
	PROVIDER_ERROR: "プロバイダーエラーが発生しました。",
	UNKNOWN_ERROR: "エラーが発生しました。再度お試しください。",
} satisfies Record<string, string>;

export const useLoginWithSocial = () => {
	const setAccountLinkToken = useSetAtom(accountLinkTokenAtom);
	const setSessionToken = useSetAtom(sessionTokenAtom);
	const setLastLoginMethod = useSetAtom(lastLoginMethodAtom);

	const [pendingProvider, setPendingProvider] = useState<SupportProvider | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFederatedAuth = useCallback(
		async (provider: SupportProvider) => {
			setPendingProvider(provider);
			const result = await federatedAuth(provider);
			if (result.isErr) {
				if (result.code === "ACCOUNT_LINK") {
					setAccountLinkToken(result.context.linkToken);
					setPendingProvider(null);
					return;
				}

				setError(errorMessageMap[result.code]);
				setPendingProvider(null);
				return;
			}

			const { sessionToken } = result.value;
			setSessionToken(sessionToken);
			setPendingProvider(null);
			setLastLoginMethod(provider);
		},
		[setAccountLinkToken, setSessionToken, setLastLoginMethod],
	);

	return {
		pendingProvider,
		error,
		authWithDiscord: () => handleFederatedAuth("discord"),
		authWithGoogle: () => handleFederatedAuth("google"),
	};
};
