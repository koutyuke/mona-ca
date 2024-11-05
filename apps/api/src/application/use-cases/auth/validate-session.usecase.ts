import { sessionExpiresSpan, sessionRefreshSpan } from "@/common/constants";
import { Session } from "@/domain/session";
import type { ISessionRepository } from "@/interface-adapter/repositories/session";
import type { IUserRepository } from "@/interface-adapter/repositories/user";
import type { ISessionTokenService } from "@/services/session-token";
import type { IValidateSessionUseCase, IValidateSessionUseCaseResult } from "./interface/validate-session.usecase";

export class ValidateSessionUseCase implements IValidateSessionUseCase {
	constructor(
		private readonly sessionTokenService: ISessionTokenService,
		private readonly sessionRepository: ISessionRepository,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(sessionToken: string): Promise<IValidateSessionUseCaseResult> {
		const sessionId = this.sessionTokenService.hashSessionToken(sessionToken);

		let [user, session] = await Promise.all([
			this.userRepository.findBySessionId(sessionId),
			this.sessionRepository.find(sessionId),
		]);

		if (!session || !user) {
			return { session: null, user: null };
		}

		if (session.isExpired) {
			await this.sessionRepository.delete(sessionId);
			return { session: null, user: null };
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
