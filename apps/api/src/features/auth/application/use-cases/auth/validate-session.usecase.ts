import { err, ok } from "@mona-ca/core/utils";
import { createSession, isExpiredSession, isRefreshableSession } from "../../../domain/entities/session";
import { parseAnySessionToken } from "../../../domain/value-objects/session-token";

import type { ISessionSecretHasher } from "../../../../../shared/ports/system";
import type { SessionToken } from "../../../domain/value-objects/session-token";
import type {
	IValidateSessionUseCase,
	ValidateSessionUseCaseResult,
} from "../../contracts/auth/validate-session.usecase";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

export class ValidateSessionUseCase implements IValidateSessionUseCase {
	constructor(
		private readonly sessionRepository: ISessionRepository,
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	public async execute(sessionToken: SessionToken): Promise<ValidateSessionUseCaseResult> {
		const idAndSecret = parseAnySessionToken(sessionToken);
		if (!idAndSecret) {
			return err("SESSION_INVALID");
		}

		const { id: sessionId, secret: sessionSecret } = idAndSecret;

		let [userIdentity, session] = await Promise.all([
			this.authUserRepository.findBySessionId(sessionId),
			this.sessionRepository.findById(sessionId),
		]);

		if (!session || !userIdentity || !this.sessionSecretHasher.verify(sessionSecret, session.secretHash)) {
			return err("SESSION_INVALID");
		}

		if (isExpiredSession(session)) {
			await this.sessionRepository.deleteById(sessionId);
			return err("SESSION_EXPIRED");
		}

		if (isRefreshableSession(session)) {
			session = createSession(session);

			await this.sessionRepository.save(session);
		}

		return ok({ session, userIdentity });
	}
}
