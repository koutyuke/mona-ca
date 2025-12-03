import { err, ok } from "@mona-ca/core/utils";
import { newUserId } from "../../../../../core/domain/value-objects";
import { ulid } from "../../../../../core/lib/id";
import { createSession } from "../../../domain/entities/session";
import { newSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { Gender, UserId } from "../../../../../core/domain/value-objects";
import type { IPasswordHashingService, ITokenSecretService } from "../../../../../core/ports/system";
import type { Session } from "../../../domain/entities/session";
import type { SignupSession } from "../../../domain/entities/signup-session";
import { createUserRegistration } from "../../../domain/entities/user-registration";
import type { SessionToken } from "../../../domain/value-objects/tokens";
import type {
	ISignupRegisterUseCase,
	SignupRegisterUseCaseResult,
} from "../../contracts/signup/register.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";
import type { ISignupSessionRepository } from "../../ports/repositories/signup-session.repository.interface";

export class SignupRegisterUseCase implements ISignupRegisterUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly signupSessionRepository: ISignupSessionRepository,
		// system
		private readonly tokenSecretService: ITokenSecretService,
		private readonly passwordHashingService: IPasswordHashingService,
	) {}

	async execute(
		signupSession: SignupSession,
		name: string,
		password: string,
		gender: Gender,
	): Promise<SignupRegisterUseCaseResult> {
		if (!signupSession.emailVerified) {
			return err("EMAIL_VERIFICATION_REQUIRED");
		}

		const existingUserCredentialsForSameEmail = await this.authUserRepository.findByEmail(signupSession.email);
		if (existingUserCredentialsForSameEmail) {
			await this.signupSessionRepository.deleteById(signupSession.id);
			return err("EMAIL_ALREADY_REGISTERED");
		}

		const userId = newUserId(ulid());
		const passwordHash = await this.passwordHashingService.hash(password);

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
		const id = newSessionId(ulid());
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);
		const sessionToken = encodeToken(id, secret);
		const session = createSession({
			id,
			userId,
			secretHash,
		});
		return { session, sessionToken };
	}
}
