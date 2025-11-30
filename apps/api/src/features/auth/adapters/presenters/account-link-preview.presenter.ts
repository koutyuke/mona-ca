import type { AccountLinkSession } from "../../domain/entities/account-link-session";
import type { RawIdentityProviders } from "../../domain/value-objects/identity-providers";

type AccountLinkPreviewResponse = {
	email: string;
	provider: RawIdentityProviders;
	providerId: string;
};

export const toAccountLinkPreviewResponse = (accountLinkSession: AccountLinkSession): AccountLinkPreviewResponse => {
	return {
		email: accountLinkSession.email,
		provider: accountLinkSession.provider,
		providerId: accountLinkSession.providerUserId,
	};
};
