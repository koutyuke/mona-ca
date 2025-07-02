import { err } from "../../../common/utils";
import { createSession, isExpiredSession, isRefreshableSession } from "../../../domain/entities";
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
		const idAndSecret = this.sessionTokenService.separateTokenToIdAndSecret(sessionToken);
		if (!idAndSecret) {
			return err("INVALID_SESSION_TOKEN");
		}

		const { id } = idAndSecret;

		let [user, session] = await Promise.all([
			this.userRepository.findBySessionId(id),
			this.sessionRepository.findById(id),
		]);

		if (!session || !user) {
			return err("SESSION_OR_USER_NOT_FOUND");
		}

		if (isExpiredSession(session)) {
			await this.sessionRepository.delete(id);
			return err("EXPIRED_SESSION");
		}

		if (isRefreshableSession(session)) {
			session = createSession(session);

			await this.sessionRepository.save(session);
		}

		return { session, user };
	}
}
