import { SESSION_COOKIE_NAME } from "@/common/constants";
import { TimeSpan } from "@/common/utils/time-span";
import { Cookie, type CookieAttributes } from "@/domain/cookie";
import { Session } from "@/domain/session";
import type { User } from "@/domain/user";
import type { IArgon2idService } from "@/infrastructure/argon2id";
import type { ISessionRepository } from "@/interface-adapter/repositories/session";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import type { Cookie as ElysiaCookie } from "elysia";
import type { IAuthUseCase } from "./interface/auth.usecase.interface";

export class AuthUseCase implements IAuthUseCase {
	private readonly sessionExpiresSpan = new TimeSpan(30, "d");
	private readonly sessionRefreshSpan = new TimeSpan(15, "d");

	private readonly sessionCookieName = SESSION_COOKIE_NAME;

	private readonly baseCookieAttributes: CookieAttributes;

	constructor(
		production: boolean,
		private readonly sessionRepository: ISessionRepository,
		private readonly argon2idService: IArgon2idService,
	) {
		this.baseCookieAttributes = {
			secure: production,
			domain: production ? "mona-ca.com" : "localhost",
			sameSite: "lax",
			httpOnly: true,
			path: "/",
		};
	}

	// Session Token
	public hashToken(token: string, pepper: string): string {
		return encodeHexLowerCase(sha256(new TextEncoder().encode(token + pepper)));
	}

	public generateSessionToken(): string {
		const bytes = new Uint8Array(24);
		crypto.getRandomValues(bytes);
		const token = encodeBase32LowerCaseNoPadding(bytes);
		return token;
	}

	public async validateSessionToken(token: string, pepper: string): Promise<{ session: Session; user: User } | null> {
		const sessionId = this.hashToken(token, pepper);

		let { session, user } = await this.sessionRepository.findSessionAndUser(sessionId);

		if (!session || !user) {
			return null;
		}

		if (session.isExpired) {
			await this.sessionRepository.deleteSession(sessionId);
			return null;
		}

		if (Date.now() >= session.expiresAt.getTime() - this.sessionRefreshSpan.milliseconds()) {
			session = new Session({
				...session,
				expiresAt: new Date(Date.now() + this.sessionExpiresSpan.milliseconds()),
				fresh: true,
			});

			await this.sessionRepository.updateSessionExpiration(sessionId, session.expiresAt);
		}

		return { session, user };
	}

	// Session
	public async createSession(token: string, pepper: string, userId: string): Promise<Session> {
		const sessionId = this.hashToken(token, pepper);
		const session = new Session({
			id: sessionId,
			userId,
			expiresAt: new Date(Date.now() + this.sessionExpiresSpan.milliseconds()),
		});

		await this.sessionRepository.createSession(session);

		return session;
	}

	public async getUserSessions(userId: string): Promise<Session[]> {
		const databaseSessions = await this.sessionRepository.findUserSessions(userId);

		const sessions: Session[] = [];
		const deleteSessionsPromises: Promise<void>[] = [];

		for (const databaseSession of databaseSessions) {
			if (databaseSession.isExpired) {
				deleteSessionsPromises.push(this.sessionRepository.deleteSession(databaseSession.id));
			} else {
				sessions.push(databaseSession);
			}
		}

		await Promise.all(deleteSessionsPromises);

		return sessions;
	}

	public async deleteExpiredSessions(): Promise<void> {
		await this.sessionRepository.deleteExpiredSessions();
	}

	public async invalidateSession(sessionId: string): Promise<void> {
		await this.sessionRepository.deleteSession(sessionId);
	}

	public async invalidateUserSessions(userId: string): Promise<void> {
		await this.sessionRepository.deleteUserSessions(userId);
	}

	// Cookie
	public createSessionCookie(token: string): Cookie {
		return new Cookie({
			name: this.sessionCookieName,
			value: token,
			attributes: {
				...this.baseCookieAttributes,
				expires: new Date(Date.now() + this.sessionExpiresSpan.milliseconds()),
			},
		});
	}

	public createBlankSessionCookie(): Cookie {
		return new Cookie({
			name: this.sessionCookieName,
			value: "",
			attributes: {
				...this.baseCookieAttributes,
				maxAge: 0,
			},
		});
	}

	// Password
	public async hashPassword(password: string, pepper: string): Promise<string> {
		return await this.argon2idService.hash(password + pepper);
	}

	public verifyPasswordHash(password: string, pepper: string, passwordHash: string): Promise<boolean> {
		return this.argon2idService.verify(passwordHash + pepper, password);
	}

	// Utility
	public readBearerToken(authorizationHeader: string): string | null {
		const [authScheme, token] = authorizationHeader.split(" ") as [string, string | undefined];
		if (authScheme !== "Bearer") {
			return null;
		}
		return token ?? null;
	}

	public readSessionCookie(cookieHeader: {
		[key: string]: ElysiaCookie<string | undefined>;
	}): string | null {
		const sessionCookie = cookieHeader[this.sessionCookieName];
		return sessionCookie?.value ?? null;
	}
}
