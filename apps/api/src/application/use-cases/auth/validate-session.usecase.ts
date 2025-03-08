import { sessionExpiresSpan } from "../../../common/constants";
import { err } from "../../../common/utils";
import { Session } from "../../../domain/entities";
import { newSessionId } from "../../../domain/value-object";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { ISessionTokenService } from "../../services/session-token";
import type { IValidateSessionUseCase, ValidateSessionUseCaseResult } from "./interfaces/validate-session.usecase";

export class ValidateSessionUseCase implements IValidateSessionUseCase {
	constructor(
		private readonly sessionTokenService: ISessionTokenService,
		private readonly sessionRepository: ISessionRepository,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(sessionToken: string): Promise<ValidateSessionUseCaseResult> {
		const sessionId = newSessionId(this.sessionTokenService.hashSessionToken(sessionToken));

		let [user, session] = await Promise.all([
			this.userRepository.findBySessionId(sessionId),
			this.sessionRepository.findById(sessionId),
		]);

		if (!session || !user) {
			return err("SESSION_OR_USER_NOT_FOUND");
		}

		if (session.isExpired) {
			await this.sessionRepository.delete(sessionId);
			return err("SESSION_EXPIRED");
		}

		if (session.shouldRefreshExpiration) {
			session = new Session({
				...session,
				expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
			});

			await this.sessionRepository.save(session);
		}

		return { session, user };
	}
}
