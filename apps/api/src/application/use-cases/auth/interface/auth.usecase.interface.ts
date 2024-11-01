import type { Cookie } from "@/domain/cookie";
import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";
import type { Cookie as ElysiaCookie } from "elysia";

export interface IAuthUseCase {
	// Session Token
	hashToken(token: string, pepper: string): string;
	generateSessionToken(): string;
	validateSessionToken(
		token: string,
		pepper: string,
	): Promise<{
		session: Session;
		user: User;
	} | null>;

	// Session
	createSession(token: string, pepper: string, userId: User["id"]): Promise<Session>;
	getUserSessions(userId: User["id"]): Promise<Session[]>;
	deleteExpiredSessions(): Promise<void>;
	invalidateSession(sessionId: Session["id"]): Promise<void>;
	invalidateUserSessions(userId: User["id"]): Promise<void>;

	// Cookie
	createSessionCookie(token: string): Cookie;
	createBlankSessionCookie(): Cookie;

	// Password
	hashPassword(password: string, pepper: string): Promise<string>;
	verifyPasswordHash(password: string, pepper: string, passwordHash: string): Promise<boolean>;

	// Utility
	readBearerToken(authorizationHeader: string): string | null;
	readSessionCookie(cookieHeader: {
		[key: string]: ElysiaCookie<string | undefined>;
	}): string | null;
}
