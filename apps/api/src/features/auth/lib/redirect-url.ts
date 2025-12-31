import { getAPIBaseURL } from "@mona-ca/core/http";

import type { RawIdentityProviders } from "../domain/value-objects/identity-providers";

export const federatedAuthRedirectURL = (production: boolean, provider: RawIdentityProviders) => {
	const apiBaseURL = getAPIBaseURL(production);

	const providerRedirectURL = new URL(`auth/federated/${provider}/callback`, apiBaseURL);

	return providerRedirectURL.toString();
};

export const providerLinkRedirectURL = (production: boolean, provider: RawIdentityProviders) => {
	const apiBaseURL = getAPIBaseURL(production);

	const providerRedirectURL = new URL(`users/me/identities/federated/${provider}/link/callback`, apiBaseURL);

	return providerRedirectURL.toString();
};
