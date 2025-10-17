import { err, ok } from "@mona-ca/core/utils";
import type { ISignupConfirmUseCase, SignupConfirmUseCaseResult } from "../../../../../application/ports/in";
import {
	type Gender,
	type SessionToken,
	type UserId,
	formatSessionToken,
	newSessionId,
	newUserId,
} from "../../../../../common/domain/value-objects";
import type { IPasswordHasher, ISessionSecretHasher } from "../../../../../common/ports/system";
import { ulid } from "../../../../../lib/utils";
import { type Session, type SignupSession, createSession, createUser } from "../../../domain/entities";
import type { ISessionRepository, ISignupSessionRepository, IUserRepository } from "../../ports/out/repositories";

export class SignupConfirmUseCase implements ISignupConfirmUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
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

		const passwordHash = await this.passwordHasher.hash(password);

		const { session, sessionToken } = this.createSession(userId);

		await this.userRepository.save(user, { passwordHash });
		await this.sessionRepository.save(session);

		await this.signupSessionRepository.deleteById(signupSession.id);

		return ok({
			user,
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
		const sessionToken = formatSessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId,
			secretHash: sessionSecretHash,
		});
		return { session, sessionToken };
	}
}
