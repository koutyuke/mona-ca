import type { AccountLinkRequest } from "../../domain/entities/account-link-request";
import type { RawIdentityProviders } from "../../domain/value-objects/identity-providers";

type AccountLinkPreviewResponse = {
	email: string;
	provider: RawIdentityProviders;
	providerId: string;
};

export const toAccountLinkPreviewResponse = (accountLinkRequest: AccountLinkRequest): AccountLinkPreviewResponse => {
	return {
		email: accountLinkRequest.email,
		provider: accountLinkRequest.provider,
		providerId: accountLinkRequest.providerUserId,
	};
};
