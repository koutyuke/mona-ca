import { constantTimeCompare, err } from "../../../common/utils";
import { createOAuthAccount, createSession, isExpiredAccountAssociationSession } from "../../../domain/entities";
import {
	type AccountAssociationSessionId,
	newAccountAssociationSessionId,
	newSessionId,
} from "../../../domain/value-object";
import type { IAccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { ISessionTokenService } from "../../services/session-token";
import type {
	AccountAssociationConfirmUseCaseResult,
	IAccountAssociationConfirmUseCase,
} from "./interfaces/account-association-confirm.interface.usecase";

export class AccountAssociationConfirmUseCase implements IAccountAssociationConfirmUseCase {
	constructor(
		private readonly sessionTokenService: ISessionTokenService,
		private readonly accountAssociationSessionTokenService: ISessionTokenService,
		private readonly sessionRepository: ISessionRepository,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly oauthAccountRepository: IOAuthAccountRepository,
		private readonly accountAssociationSessionRateLimit: (
			accountAssociationSessionId: AccountAssociationSessionId,
		) => Promise<void>,
	) {}

	public async execute(
		accountAssociationSessionToken: string,
		code: string,
	): Promise<AccountAssociationConfirmUseCaseResult> {
		const accountAssociationSessionId = newAccountAssociationSessionId(
			this.accountAssociationSessionTokenService.hashSessionToken(accountAssociationSessionToken),
		);
		const accountAssociationSession =
			await this.accountAssociationSessionRepository.findById(accountAssociationSessionId);

		if (accountAssociationSession === null) {
			return err("INVALID_TOKEN");
		}

		await this.accountAssociationSessionRateLimit(accountAssociationSessionId);

		if (!constantTimeCompare(accountAssociationSession.code, code)) {
			return err("INVALID_CODE");
		}

		await this.accountAssociationSessionRepository.delete(accountAssociationSessionId);

		if (isExpiredAccountAssociationSession(accountAssociationSession)) {
			return err("EXPIRED_TOKEN");
		}

		const [existingOAuthAccount, existingUserLinkedAccount] = await Promise.all([
			this.oauthAccountRepository.findByProviderAndProviderId(
				accountAssociationSession.provider,
				accountAssociationSession.providerId,
			),
			this.oauthAccountRepository.findByUserIdAndProvider(
				accountAssociationSession.userId,
				accountAssociationSession.provider,
			),
		]);

		if (existingUserLinkedAccount) {
			return err("PROVIDER_ALREADY_LINKED");
		}

		if (existingOAuthAccount) {
			return err("ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER");
		}

		const sessionToken = this.sessionTokenService.generateSessionToken();
		const sessionId = newSessionId(this.sessionTokenService.hashSessionToken(sessionToken));
		const session = createSession({
			id: sessionId,
			userId: accountAssociationSession.userId,
		});

		const oauthAccount = createOAuthAccount({
			provider: accountAssociationSession.provider,
			providerId: accountAssociationSession.providerId,
			userId: accountAssociationSession.userId,
		});

		await Promise.all([this.oauthAccountRepository.save(oauthAccount), this.sessionRepository.save(session)]);

		return {
			session,
			sessionToken,
		};
	}
}
