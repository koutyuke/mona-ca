import { err, ok } from "@mona-ca/core/utils";
import { newUserId } from "../../../../../shared/domain/value-objects";
import { ulid } from "../../../../../shared/lib/id";
import { createSession } from "../../../domain/entities/session";
import { newSessionId } from "../../../domain/value-objects/ids";
import { formatAnySessionToken } from "../../../domain/value-objects/session-token";

import type { Gender, UserId } from "../../../../../shared/domain/value-objects";
import type { IPasswordHasher, ISessionSecretHasher } from "../../../../../shared/ports/system";
import type { Session } from "../../../domain/entities/session";
import type { SignupSession } from "../../../domain/entities/signup-session";
import { createUserRegistration } from "../../../domain/entities/user-registration";
import type { SessionToken } from "../../../domain/value-objects/session-token";
import type {
	ISignupConfirmUseCase,
	SignupConfirmUseCaseResult,
} from "../../contracts/basic-auth/signup-confirm.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";
import type { ISignupSessionRepository } from "../../ports/repositories/signup-session.repository.interface";

export class SignupConfirmUseCase implements ISignupConfirmUseCase {
	constructor(
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly signupSessionRepository: ISignupSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
		private readonly passwordHasher: IPasswordHasher,
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

		const existingUserIdentityForSameEmail = await this.authUserRepository.findByEmail(signupSession.email);
		if (existingUserIdentityForSameEmail) {
			await this.signupSessionRepository.deleteById(signupSession.id);
			return err("EMAIL_ALREADY_REGISTERED");
		}

		const userId = newUserId(ulid());
		const passwordHash = await this.passwordHasher.hash(password);

		const userRegistration = createUserRegistration({
			id: userId,
			name,
			email: signupSession.email,
			emailVerified: true,
			iconUrl: null,
			gender,
			passwordHash,
		});

		const { session, sessionToken } = this.createSession(userId);

		await this.authUserRepository.create(userRegistration);
		await this.sessionRepository.save(session);

		await this.signupSessionRepository.deleteById(signupSession.id);

		return ok({
			session,
			sessionToken,
		});
	}

	private createSession(userId: UserId): {
		session: Session;
		sessionToken: SessionToken;
	} {
		const sessionSecret = this.sessionSecretHasher.generate();
		const sessionSecretHash = this.sessionSecretHasher.hash(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = formatAnySessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId,
			secretHash: sessionSecretHash,
		});
		return { session, sessionToken };
	}
}
