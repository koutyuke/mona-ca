import { getAPIBaseURL } from "@mona-ca/core/utils";
import type { SupportProvider } from "../model/support-provider";

export const getSocialAuthURLString = (provider: SupportProvider, method: "login" | "signup", redirectURI: string) => {
	const baseURL = getAPIBaseURL(process.env.EXPO_PUBLIC_APP_ENV === "production");

	const path = `/auth/${provider}/${method}`;

	const url = new URL(path, baseURL);

	url.searchParams.set("client-type", "mobile");
	url.searchParams.set("redirect-uri", redirectURI);

	return url.toString();
};
