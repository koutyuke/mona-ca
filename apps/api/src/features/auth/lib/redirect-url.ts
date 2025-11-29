import { getAPIBaseURL } from "@mona-ca/core/utils";
import type { RawIdentityProviders } from "../domain/value-objects/identity-providers";

export const federatedAuthRedirectURL = (production: boolean, provider: RawIdentityProviders) => {
	const apiBaseURL = getAPIBaseURL(production);

	const providerRedirectURL = new URL(`auth/federated/${provider}/callback`, apiBaseURL);

	return providerRedirectURL.toString();
};

export const providerConnectionRedirectURL = (production: boolean, provider: RawIdentityProviders) => {
	const apiBaseURL = getAPIBaseURL(production);

	const providerRedirectURL = new URL(`me/connections/${provider}/callback`, apiBaseURL);

	return providerRedirectURL.toString();
};
