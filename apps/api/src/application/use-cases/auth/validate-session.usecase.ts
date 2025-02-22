import { sessionExpiresSpan, sessionRefreshSpan } from "../../../common/constants";
import { err } from "../../../common/utils";
import { Session } from "../../../domain/entities/session";
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
		const sessionId = this.sessionTokenService.hashSessionToken(sessionToken);

		let [user, session] = await Promise.all([
			this.userRepository.findBySessionId(sessionId),
			this.sessionRepository.find(sessionId),
		]);

		if (!session || !user) {
			return err("SESSION_OR_USER_NOT_FOUND");
		}

		if (session.isExpired) {
			await this.sessionRepository.delete(sessionId);
			return err("SESSION_EXPIRED");
		}

		if (Date.now() >= session.expiresAt.getTime() - sessionRefreshSpan.milliseconds()) {
			session = new Session({
				...session,
				expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
				fresh: true,
			});

			await this.sessionRepository.updateExpiration(sessionId, session.expiresAt);
		}

		return { session, user };
	}
}
