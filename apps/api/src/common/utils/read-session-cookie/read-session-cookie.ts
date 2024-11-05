import { SESSION_COOKIE_NAME } from "@/common/constants";
import type { Cookie } from "elysia";

export const readSessionCookie = (cookieHeader: Record<string, Cookie<string | undefined>>): string | null => {
	return cookieHeader[SESSION_COOKIE_NAME]?.value ?? null;
};
