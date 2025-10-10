import { err, ulid } from "../../../common/utils";
import { type Session, type SignupSession, createSession, createUser } from "../../../domain/entities";
import {
	type Gender,
	type SessionToken,
	type UserId,
	formatSessionToken,
	newSessionId,
	newUserId,
} from "../../../domain/value-object";
import { generateSessionSecret, hashSessionSecret } from "../../../infrastructure/crypt";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { ISignupSessionRepository } from "../../../interface-adapter/repositories/signup-session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IPasswordService } from "../../services/password";
import type { ISignupConfirmUseCase, SignupConfirmUseCaseResult } from "./interfaces/signup-confirm.usecase.interface";

export class SignupConfirmUseCase implements ISignupConfirmUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly signupSessionRepository: ISignupSessionRepository,
		private readonly passwordService: IPasswordService,
	) {}

	async execute(
		signupSession: SignupSession,
		name: string,
		password: string,
		gender: Gender,
	): Promise<SignupConfirmUseCaseResult> {
		if (!signupSession.emailVerified) {
			return err("EMAIL_VERIFICATION_REQUIRED");
		}

		const existingSameEmailUser = await this.userRepository.findByEmail(signupSession.email);
		if (existingSameEmailUser) {
			await this.signupSessionRepository.deleteById(signupSession.id);
			return err("EMAIL_ALREADY_REGISTERED");
		}

		const userId = newUserId(ulid());
		const user = createUser({
			id: userId,
			name,
			email: signupSession.email,
			emailVerified: true,
			iconUrl: null,
			gender,
		});

		const passwordHash = await this.passwordService.hashPassword(password);

		const { session, sessionToken } = this.createSession(userId);

		await this.userRepository.save(user, { passwordHash });
		await this.sessionRepository.save(session);

		await this.signupSessionRepository.deleteById(signupSession.id);

		return {
			user,
			session,
			sessionToken,
		};
	}

	private createSession(userId: UserId): {
		session: Session;
		sessionToken: SessionToken;
	} {
		const sessionSecret = generateSessionSecret();
		const sessionSecretHash = hashSessionSecret(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = formatSessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId,
			secretHash: sessionSecretHash,
		});
		return { session, sessionToken };
	}
}
