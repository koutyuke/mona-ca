import { isErr } from "@mona-ca/core/utils";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { accountAssociationSessionTokenAtom, sessionTokenAtom } from "../../../entities/session";
import { signupWithSocial } from "../api/signup-with-social";
import { lastLoginMethodAtom } from "./last-login-method-atom";
import type { SupportProvider } from "./support-provider";
import { visitPersonalizePageFlagAtom } from "./visit-personalize-page-flag-atom";

export const useSignupWithSocial = () => {
	const setAccountAssociationToken = useSetAtom(accountAssociationSessionTokenAtom);
	const setSessionToken = useSetAtom(sessionTokenAtom);
	const setLastLoginMethod = useSetAtom(lastLoginMethodAtom);
	const setVisitPersonalizePageFlag = useSetAtom(visitPersonalizePageFlagAtom);

	const [pendingProvider, setPendingProvider] = useState<SupportProvider | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleSignupWithSocial = async (provider: SupportProvider) => {
		setPendingProvider(provider);
		const result = await signupWithSocial(provider);
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
		setVisitPersonalizePageFlag(true);
	};

	return {
		pendingProvider,
		error,
		signupWithDiscord: () => handleSignupWithSocial("discord"),
		signupWithGoogle: () => handleSignupWithSocial("google"),
	};
};
