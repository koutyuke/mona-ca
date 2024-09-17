import type { Cookie } from "@/domain/cookie";
import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";

export interface ILuciaService {
	createBlankSessionCookie(): Cookie;
	createSession(userId: User["id"]): Promise<Session>;
	createSessionCookie(sessionId: Session["id"]): Cookie;
	deleteExpiredSessions(): Promise<void>;
	getUserSessions(userId: User["id"]): Promise<Session[]>;
	invalidateSession(sessionId: Session["id"]): Promise<void>;
	invalidateUserSessions(userId: User["id"]): Promise<void>;
	readBearerToken(authorizationHeader: string): string | null;
	readSessionCookie(cookieHeader: string): string | null;
	validateSession(sessionId: Session["id"]): Promise<{
		session: Session;
		user: User;
	} | null>;
}
