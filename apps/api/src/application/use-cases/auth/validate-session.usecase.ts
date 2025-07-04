import { err } from "../../../common/utils";
import { createSession, isExpiredSession, isRefreshableSession } from "../../../domain/entities";
import type { SessionId } from "../../../domain/value-object";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import { type ISessionSecretService, separateSessionTokenToIdAndSecret } from "../../services/session";
import type { IValidateSessionUseCase, ValidateSessionUseCaseResult } from "./interfaces/validate-session.usecase";

export class ValidateSessionUseCase implements IValidateSessionUseCase {
	constructor(
		private readonly sessionSecretService: ISessionSecretService,
		private readonly sessionRepository: ISessionRepository,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(sessionToken: string): Promise<ValidateSessionUseCaseResult> {
		const idAndSecret = separateSessionTokenToIdAndSecret<SessionId>(sessionToken);
		if (!idAndSecret) {
			return err("INVALID_SESSION");
		}

		const { id: sessionId, secret: sessionSecret } = idAndSecret;

		let [user, session] = await Promise.all([
			this.userRepository.findBySessionId(sessionId),
			this.sessionRepository.findById(sessionId),
		]);

		if (!session || !user || !this.sessionSecretService.verifySessionSecret(sessionSecret, session.secretHash)) {
			return err("INVALID_SESSION");
		}

		if (isExpiredSession(session)) {
			await this.sessionRepository.deleteById(sessionId);
			return err("EXPIRED_SESSION");
		}

		if (isRefreshableSession(session)) {
			session = createSession(session);

			await this.sessionRepository.save(session);
		}

		return { session, user };
	}
}
