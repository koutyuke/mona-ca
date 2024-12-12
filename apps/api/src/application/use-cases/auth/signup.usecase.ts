import { sessionExpiresSpan } from "../../../common/constants";
import { ulid } from "../../../common/utils";
import type { Session } from "../../../domain/session";
import type { User } from "../../../domain/user";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IUserCredentialRepository } from "../../../interface-adapter/repositories/user-credential";
import type { IPasswordService } from "../../../services/password";
import type { ISessionTokenService } from "../../../services/session-token";
import type { ISignupUseCase } from "./interface/signup.usecase.interface";

export class SignupUseCase implements ISignupUseCase {
	constructor(
		private readonly sessionRepository: ISessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly userCredentialRepository: IUserCredentialRepository,
		private readonly passwordService: IPasswordService,
		private readonly sessionTokenService: ISessionTokenService,
	) {}

	public async execute(
		name: string,
		email: string,
		password: string,
		gender: "man" | "woman",
	): Promise<{ user: User; session: Session; sessionToken: string }> {
		const userId = ulid();
		const passwordHash = await this.passwordService.hashPassword(password);
		const sessionToken = this.sessionTokenService.generateSessionToken();

		const user = await this.userRepository.create({
			id: userId,
			name,
			email,
			emailVerified: false,
			iconUrl: null,
			gender,
		});

		const [session] = await Promise.all([
			this.createSession(sessionToken, userId),
			this.userCredentialRepository.create({
				userId,
				passwordHash,
			}),
		]);

		return {
			user,
			session,
			sessionToken,
		};
	}

	private async createSession(sessionToken: string, userId: string): Promise<Session> {
		const sessionId = this.sessionTokenService.hashSessionToken(sessionToken);

		const session = await this.sessionRepository.create({
			id: sessionId,
			userId,
			expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
		});

		return session;
	}
}
