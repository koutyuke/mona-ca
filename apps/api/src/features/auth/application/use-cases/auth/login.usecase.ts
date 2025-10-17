import { err, ok } from "@mona-ca/core/utils";
import type { ILoginUseCase, LoginUseCaseResult } from "../../../../../application/ports/in";
import {
	type SessionToken,
	type UserId,
	formatSessionToken,
	newSessionId,
} from "../../../../../common/domain/value-objects";
import type { IPasswordHasher, ISessionSecretHasher } from "../../../../../common/ports/system";
import { ulid } from "../../../../../lib/utils";
import { type Session, createSession } from "../../../domain/entities";
import type { ISessionRepository, IUserRepository } from "../../ports/out/repositories";

export class LoginUseCase implements ILoginUseCase {
	constructor(
		private readonly sessionRepository: ISessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
		private readonly passwordHasher: IPasswordHasher,
	) {}

	public async execute(email: string, password: string): Promise<LoginUseCaseResult> {
		const user = await this.userRepository.findByEmail(email);
		const passwordHash = user ? await this.userRepository.findPasswordHashById(user.id) : null;
		const verifyPasswordResult = passwordHash ? await this.passwordHasher.verify(password, passwordHash) : false;

		if (!(user && passwordHash && verifyPasswordResult)) {
			return err("INVALID_CREDENTIALS");
		}

		const { session, sessionToken } = this.createSession(user.id);

		await this.sessionRepository.save(session);

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
		const sessionToken = formatSessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId,
			secretHash: sessionSecretHash,
		});
		return { session, sessionToken };
	}
}
