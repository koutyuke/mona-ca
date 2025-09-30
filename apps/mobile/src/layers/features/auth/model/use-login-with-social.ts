import { isErr } from "@mona-ca/core/utils";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { accountAssociationSessionTokenAtom, sessionTokenAtom } from "../../../entities/session";
import { loginWithSocial } from "../api/login-with-social";
import type { SupportProvider } from "../model/support-provider";
import { lastLoginMethodAtom } from "./last-login-method-atom";

export const useLoginWithSocial = () => {
	const setAccountAssociationToken = useSetAtom(accountAssociationSessionTokenAtom);
	const setSessionToken = useSetAtom(sessionTokenAtom);
	const setLastLoginMethod = useSetAtom(lastLoginMethodAtom);

	const [pendingProvider, setPendingProvider] = useState<SupportProvider | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleLoginWithSocial = async (provider: SupportProvider) => {
		setPendingProvider(provider);
		const result = await loginWithSocial(provider);
		if (isErr(result)) {
			if (result.code === "ACCOUNT_ASSOCIATION") {
				setAccountAssociationToken(result.value.associationSessionToken);
				setPendingProvider(null);
				return;
			}

			setError(result.value.errorMessage);
			setPendingProvider(null);
			return;
		}
		const { sessionToken } = result.value;
		setSessionToken(sessionToken);
		setPendingProvider(null);
		setLastLoginMethod(provider);
	};

	return {
		pendingProvider,
		error,
		loginWithDiscord: () => handleLoginWithSocial("discord"),
		loginWithGoogle: () => handleLoginWithSocial("google"),
	};
};
