import { err, ok } from "@mona-ca/core/utils";
import type { SessionToken } from "../../../../../common/domain/value-objects";
import { parseSessionToken } from "../../../../../common/domain/value-objects";
import type { ISessionSecretHasher } from "../../../../../common/ports/system";
import { createSession, isExpiredSession, isRefreshableSession } from "../../../domain/entities";
import type { ISessionRepository, IUserRepository } from "../../ports/out/repositories";
import type {
	IValidateSessionUseCase,
	ValidateSessionUseCaseResult,
} from "../../ports/use-cases/auth/validate-session.usecase";

export class ValidateSessionUseCase implements IValidateSessionUseCase {
	constructor(
		private readonly sessionRepository: ISessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	public async execute(sessionToken: SessionToken): Promise<ValidateSessionUseCaseResult> {
		const idAndSecret = parseSessionToken(sessionToken);
		if (!idAndSecret) {
			return err("SESSION_INVALID");
		}

		const { id: sessionId, secret: sessionSecret } = idAndSecret;

		let [user, session] = await Promise.all([
			this.userRepository.findBySessionId(sessionId),
			this.sessionRepository.findById(sessionId),
		]);

		if (!session || !user || !this.sessionSecretHasher.verify(sessionSecret, session.secretHash)) {
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

		return ok({ session, user });
	}
}
