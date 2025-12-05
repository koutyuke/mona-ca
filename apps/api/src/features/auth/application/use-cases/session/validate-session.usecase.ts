import { err, ok } from "@mona-ca/core/result";
import { createSession, isExpiredSession, isRefreshableSession } from "../../../domain/entities/session";
import { decodeToken } from "../../../domain/value-objects/tokens";

import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { SessionToken } from "../../../domain/value-objects/tokens";
import type {
	IValidateSessionUseCase,
	ValidateSessionUseCaseResult,
} from "../../contracts/session/validate-session.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

export class ValidateSessionUseCase implements IValidateSessionUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionRepository: ISessionRepository,
		// system
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(sessionToken: SessionToken): Promise<ValidateSessionUseCaseResult> {
		const idAndSecret = decodeToken(sessionToken);
		if (!idAndSecret) {
			return err("SESSION_INVALID");
		}

		const { id: sessionId, secret: sessionSecret } = idAndSecret;

		let [userCredentials, session] = await Promise.all([
			this.authUserRepository.findBySessionId(sessionId),
			this.sessionRepository.findById(sessionId),
		]);

		if (!session || !userCredentials || !this.tokenSecretService.verify(sessionSecret, session.secretHash)) {
			return err("SESSION_INVALID", {
				session,
				userCredentials,
			});
		}

		if (isExpiredSession(session)) {
			await this.sessionRepository.deleteById(sessionId);
			return err("SESSION_EXPIRED");
		}

		if (isRefreshableSession(session)) {
			session = createSession(session);

			await this.sessionRepository.save(session);
		}

		return ok({ session, userCredentials });
	}
}
