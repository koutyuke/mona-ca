import { type ToPrimitive, getAPIBaseURL } from "@mona-ca/core/utils";
import type { ExternalIdentityProvider } from "../domain/value-objects/external-identity";

export const externalLoginRedirectURL = (production: boolean, provider: ToPrimitive<ExternalIdentityProvider>) => {
	const apiBaseURL = getAPIBaseURL(production);

	const providerRedirectURL = new URL(`auth/${provider}/login/callback`, apiBaseURL);

	return providerRedirectURL.toString();
};

export const externalSignupRedirectURL = (production: boolean, provider: ToPrimitive<ExternalIdentityProvider>) => {
	const apiBaseURL = getAPIBaseURL(production);

	const providerRedirectURL = new URL(`auth/${provider}/signup/callback`, apiBaseURL);

	return providerRedirectURL.toString();
};

export const externalLinkRedirectURL = (production: boolean, provider: ToPrimitive<ExternalIdentityProvider>) => {
	const apiBaseURL = getAPIBaseURL(production);

	const providerRedirectURL = new URL(`auth/${provider}/link/callback`, apiBaseURL);

	return providerRedirectURL.toString();
};
