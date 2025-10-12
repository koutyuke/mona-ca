import { err } from "../../../common/utils";
import { createSession, isExpiredSession, isRefreshableSession } from "../../../domain/entities";
import type { SessionToken } from "../../../domain/value-object";
import { parseSessionToken } from "../../../domain/value-object";
import type {
	IValidateSessionUseCase,
	ValidateSessionUseCaseResult,
} from "../../ports/in/auth/validate-session.usecase";
import type { ISessionRepository, IUserRepository } from "../../ports/out/repositories";
import type { ISessionSecretHasher } from "../../ports/out/system";

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

		return { session, user };
	}
}
