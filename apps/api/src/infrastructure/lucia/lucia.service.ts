import { Cookie } from "@/domain/cookie";
import { Session } from "@/domain/session";
import { User } from "@/domain/user";
import { Lucia, type SessionCookieOptions } from "lucia";
import type { ILuciaAdapter } from "./interface/lucia.adapter.interface";
import type { ILuciaService } from "./interface/lucia.service.interface";
import type { DatabaseUserAttributes, LuciaWithDatabaseTypes } from "./lucia.type";

export class LuciaService implements ILuciaService {
	private readonly lucia: LuciaWithDatabaseTypes;

	constructor(adapter: ILuciaAdapter, sessionCookie: SessionCookieOptions) {
		this.lucia = new Lucia(adapter, {
			sessionCookie,
			getUserAttributes(databaseUserAttributes) {
				return {
					email: databaseUserAttributes.email,
					emailVerified: databaseUserAttributes.emailVerified,
					name: databaseUserAttributes.name,
					iconUrl: databaseUserAttributes.iconUrl,
					gender: databaseUserAttributes.gender,
					createdAt: databaseUserAttributes.createdAt,
					updatedAt: databaseUserAttributes.updatedAt,
				} satisfies DatabaseUserAttributes;
			},
		});
	}

	public createBlankSessionCookie(): Cookie {
		const cookie = this.lucia.createBlankSessionCookie();
		return new Cookie(cookie);
	}

	public async createSession(userId: string): Promise<Session> {
		const session = await this.lucia.createSession(userId, {});
		return new Session(session);
	}

	public createSessionCookie(sessionId: string): Cookie {
		const cookie = this.lucia.createSessionCookie(sessionId);
		return new Cookie(cookie);
	}

	public deleteExpiredSessions(): Promise<void> {
		return this.lucia.deleteExpiredSessions();
	}

	public async getUserSessions(userId: string): Promise<Session[]> {
		const sessions = await this.lucia.getUserSessions(userId);
		return sessions.map(session => new Session(session));
	}

	public invalidateSession(sessionId: string): Promise<void> {
		return this.lucia.invalidateSession(sessionId);
	}

	public invalidateUserSessions(userId: string): Promise<void> {
		return this.lucia.invalidateUserSessions(userId);
	}

	public readBearerToken(authorizationHeader: string): string | null {
		return this.lucia.readBearerToken(authorizationHeader);
	}

	public readSessionCookie(cookieHeader: string): string | null {
		return this.lucia.readSessionCookie(cookieHeader);
	}

	public async validateSession(sessionId: string): Promise<{ session: Session; user: User } | null> {
		const result = await this.lucia.validateSession(sessionId);
		if (!result.user || !result.session) return null;
		return {
			session: new Session(result.session),
			user: new User(result.user),
		};
	}
}
