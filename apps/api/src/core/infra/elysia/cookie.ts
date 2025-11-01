import { PRODUCTION_BASE_DOMAIN } from "../../lib/http";
import { env } from "../config/env";

export const defaultCookieOptions = {
	domain: env.APP_ENV === "production" ? PRODUCTION_BASE_DOMAIN : undefined,
	secure: env.APP_ENV === "production",
	httpOnly: true,
	sameSite: "lax",
	path: "/",
} as const;
