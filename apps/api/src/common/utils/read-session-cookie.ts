import type { Cookie } from "elysia";
import { SESSION_COOKIE_NAME } from "../../constants";

export const readSessionCookie = (cookieHeader: Record<string, Cookie<string | undefined>>): string | null => {
	return cookieHeader[SESSION_COOKIE_NAME]?.value ?? null;
};
