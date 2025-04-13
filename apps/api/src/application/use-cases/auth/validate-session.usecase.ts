import { err } from "../../../common/utils";
import { createSession, isExpiredSession, isRefreshableSession } from "../../../domain/entities";
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

		if (isExpiredSession(session)) {
			await this.sessionRepository.delete(sessionId);
			return err("SESSION_EXPIRED");
		}

		if (isRefreshableSession(session)) {
			session = createSession({
				id: session.id,
				userId: session.userId,
			});

			await this.sessionRepository.save(session);
		}

		return { session, user };
	}
}
