import { getWebBaseURL } from "@mona-ca/core/http";
import { env } from "../config/env";

export const defaultCookieOptions = {
	domain: getWebBaseURL(env.APP_ENV === "production").hostname,
	secure: env.APP_ENV === "production",
	httpOnly: true,
	sameSite: "lax",
	path: "/",
} as const;
