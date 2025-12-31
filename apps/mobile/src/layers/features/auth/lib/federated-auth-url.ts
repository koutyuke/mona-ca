import { getAPIBaseURL } from "@mona-ca/core/http";

import type { SupportProvider } from "../model/support-provider";

export const federatedAuthURL = (provider: SupportProvider, redirectURI: string) => {
	const baseURL = getAPIBaseURL(process.env.EXPO_PUBLIC_APP_ENV === "production");

	const path = `/auth/federated/${provider}`;

	const url = new URL(path, baseURL);

	url.searchParams.set("platform", "mobile");
	url.searchParams.set("redirect-uri", redirectURI);

	return url;
};
