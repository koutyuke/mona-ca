import { err, ok } from "@mona-ca/core/result";
import { isExpiredAccountLinkSession } from "../../../domain/entities/account-link-session";
import { decodeToken } from "../../../domain/value-objects/tokens";

import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { AccountLinkSessionToken } from "../../../domain/value-objects/tokens";
import type {
	AccountLinkValidateSessionUseCaseResult,
	IAccountLinkValidateSessionUseCase,
} from "../../contracts/account-link/validate-session.usecase.interface";
import type { IAccountLinkSessionRepository } from "../../ports/repositories/account-link-session.repository.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";

export class AccountLinkValidateSessionUseCase implements IAccountLinkValidateSessionUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly accountLinkSessionRepository: IAccountLinkSessionRepository,
		// infra
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(
		accountLinkSessionToken: AccountLinkSessionToken,
	): Promise<AccountLinkValidateSessionUseCaseResult> {
		const accountLinkSessionIdAndSecret = decodeToken(accountLinkSessionToken);

		if (!accountLinkSessionIdAndSecret) {
			return err("ACCOUNT_LINK_SESSION_INVALID");
		}

		const { id: accountLinkSessionId, secret: accountLinkSessionSecret } = accountLinkSessionIdAndSecret;

		const accountLinkSession = await this.accountLinkSessionRepository.findById(accountLinkSessionId);

		if (!accountLinkSession) {
			return err("ACCOUNT_LINK_SESSION_INVALID");
		}

		if (!this.tokenSecretService.verify(accountLinkSessionSecret, accountLinkSession.secretHash)) {
			return err("ACCOUNT_LINK_SESSION_INVALID");
		}

		if (isExpiredAccountLinkSession(accountLinkSession)) {
			await this.accountLinkSessionRepository.deleteById(accountLinkSessionId);
			return err("ACCOUNT_LINK_SESSION_EXPIRED");
		}

		const userCredentials = await this.authUserRepository.findById(accountLinkSession.userId);

		if (!userCredentials || userCredentials.email !== accountLinkSession.email) {
			await this.accountLinkSessionRepository.deleteById(accountLinkSessionId);
			return err("ACCOUNT_LINK_SESSION_INVALID");
		}

		return ok({ accountLinkSession, userCredentials });
	}
}
