import { getAPIBaseURL } from "@mona-ca/core/utils";
import type { RawIdentityProviders } from "../domain/value-objects/identity-providers";

export const externalLoginRedirectURL = (production: boolean, provider: RawIdentityProviders) => {
	const apiBaseURL = getAPIBaseURL(production);

	const providerRedirectURL = new URL(`auth/${provider}/login/callback`, apiBaseURL);

	return providerRedirectURL.toString();
};

export const externalSignupRedirectURL = (production: boolean, provider: RawIdentityProviders) => {
	const apiBaseURL = getAPIBaseURL(production);

	const providerRedirectURL = new URL(`auth/${provider}/signup/callback`, apiBaseURL);

	return providerRedirectURL.toString();
};

export const externalLinkRedirectURL = (production: boolean, provider: RawIdentityProviders) => {
	const apiBaseURL = getAPIBaseURL(production);

	const providerRedirectURL = new URL(`auth/${provider}/link/callback`, apiBaseURL);

	return providerRedirectURL.toString();
};
