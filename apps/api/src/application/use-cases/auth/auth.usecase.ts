import { SESSION_COOKIE_NAME } from "@/common/constants";
import type { Cookie } from "@/domain/cookie";
import type { Session } from "@/domain/session";
import type { User } from "@/domain/user";
import { Argon2idService } from "@/infrastructure/argon2id";
import { type ILuciaAdapter, LuciaService } from "@/infrastructure/lucia";
import type { Cookie as ElysiaCookie } from "elysia";
import type { IAuthUseCase } from "./interface/auth.usecase.interface";

export class AuthUseCase implements IAuthUseCase {
	private readonly luciaService: LuciaService;
	private readonly argon2id: Argon2idService;

	constructor(production: boolean, luciaAdapter: ILuciaAdapter) {
		this.luciaService = new LuciaService(luciaAdapter, {
			name: SESSION_COOKIE_NAME,
			attributes: {
				secure: production,
				domain: production ? ".mona-ca.com" : "localhost",
			},
		});
		this.argon2id = new Argon2idService();
	}

	public createBlankSessionCookie(): Cookie {
		return this.luciaService.createBlankSessionCookie();
	}

	public async createSession(userId: string): Promise<Session> {
		return this.luciaService.createSession(userId);
	}

	public createSessionCookie(sessionId: string): Cookie {
		return this.luciaService.createSessionCookie(sessionId);
	}

	public deleteExpiredSessions(): Promise<void> {
		return this.luciaService.deleteExpiredSessions();
	}

	public async getUserSessions(userId: string): Promise<Session[]> {
		return this.luciaService.getUserSessions(userId);
	}

	public invalidateSession(sessionId: string): Promise<void> {
		return this.luciaService.invalidateSession(sessionId);
	}

	public invalidateUserSessions(userId: string): Promise<void> {
		return this.luciaService.invalidateUserSessions(userId);
	}

	public async validateSession(sessionId: string): Promise<{ session: Session; user: User } | null> {
		return this.luciaService.validateSession(sessionId);
	}

	public readBearerToken(authorizationHeader: string): string | null {
		return this.luciaService.readBearerToken(authorizationHeader);
	}

	public readSessionCookie(cookieHeader: {
		[key: string]: ElysiaCookie<string | undefined>;
	}): string | null {
		const sessionCookie = cookieHeader[SESSION_COOKIE_NAME];
		return sessionCookie?.value ?? null;
	}

	public async hashedPassword(password: string): Promise<string> {
		return await this.argon2id.hash(password);
	}

	public verifyHashedPassword(password: string, hashedPassword: string): Promise<boolean> {
		return this.argon2id.verify(hashedPassword, password);
	}
}
