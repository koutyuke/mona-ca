import type { Cookie } from "@/domain/cookie";
import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";
import type { Cookie as ElysiaCookie } from "elysia";

export interface IAuthUseCase {
	// Session Token
	hashToken(token: string): string;
	generateSessionToken(): string;
	validateSessionToken(token: string): Promise<{
		session: Session;
		user: User;
	} | null>;

	// Session
	createSession(token: string, userId: User["id"]): Promise<Session>;
	getUserSessions(userId: User["id"]): Promise<Session[]>;
	deleteExpiredSessions(): Promise<void>;
	invalidateSession(sessionId: Session["id"]): Promise<void>;
	invalidateUserSessions(userId: User["id"]): Promise<void>;

	// Cookie
	createSessionCookie(token: string): Cookie;
	createBlankSessionCookie(): Cookie;

	// Password
	hashPassword(password: string): Promise<string>;
	verifyPasswordHash(password: string, passwordHash: string): Promise<boolean>;

	// Utility
	readBearerToken(authorizationHeader: string): string | null;
	readSessionCookie(cookieHeader: {
		[key: string]: ElysiaCookie<string | undefined>;
	}): string | null;
}
