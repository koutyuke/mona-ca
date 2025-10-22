import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../../../core/lib/id";
import { createSession } from "../../../domain/entities/session";
import { newSessionId } from "../../../domain/value-objects/ids";
import { formatAnySessionToken } from "../../../domain/value-objects/session-token";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IPasswordHasher, ISessionSecretHasher } from "../../../../../core/ports/system";
import type { Session } from "../../../domain/entities/session";
import type { SessionToken } from "../../../domain/value-objects/session-token";
import type { ILoginUseCase, LoginUseCaseResult } from "../../contracts/basic-auth/login.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

export class LoginUseCase implements ILoginUseCase {
	constructor(
		private readonly sessionRepository: ISessionRepository,
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
		private readonly passwordHasher: IPasswordHasher,
	) {}

	public async execute(email: string, password: string): Promise<LoginUseCaseResult> {
		const userIdentity = await this.authUserRepository.findByEmail(email);

		if (!userIdentity || !userIdentity.passwordHash) {
			return err("INVALID_CREDENTIALS");
		}

		const verifyPasswordResult = await this.passwordHasher.verify(password, userIdentity.passwordHash);

		if (!verifyPasswordResult) {
			return err("INVALID_CREDENTIALS");
		}

		const { session, sessionToken } = this.createSession(userIdentity.id);

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
		const sessionToken = formatAnySessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId,
			secretHash: sessionSecretHash,
		});
		return { session, sessionToken };
	}
}
