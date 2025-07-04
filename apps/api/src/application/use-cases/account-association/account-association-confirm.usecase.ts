import { err, timingSafeStringEqual, ulid } from "../../../common/utils";
import { type AccountAssociationSession, createOAuthAccount, createSession } from "../../../domain/entities";
import { newSessionId } from "../../../domain/value-object";
import type { IAccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import { type ISessionSecretService, createSessionToken } from "../../services/session";
import type {
	AccountAssociationConfirmUseCaseResult,
	IAccountAssociationConfirmUseCase,
} from "./interfaces/account-association-confirm.interface.usecase";

// this use case will be called after the validate account association session use case.
// so we don't need to check the expired account association session.
export class AccountAssociationConfirmUseCase implements IAccountAssociationConfirmUseCase {
	constructor(
		private readonly sessionRepository: ISessionRepository,
		private readonly oauthAccountRepository: IOAuthAccountRepository,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly sessionTokenService: ISessionSecretService,
	) {}

	public async execute(
		code: string,
		accountAssociationSession: AccountAssociationSession,
	): Promise<AccountAssociationConfirmUseCaseResult> {
		if (accountAssociationSession.code === null) {
			return err("INVALID_CODE");
		}

		if (!timingSafeStringEqual(accountAssociationSession.code, code)) {
			return err("INVALID_CODE");
		}

		await this.accountAssociationSessionRepository.deleteById(accountAssociationSession.id);

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

		const sessionSecret = this.sessionTokenService.generateSessionSecret();
		const sessionSecretHash = this.sessionTokenService.hashSessionSecret(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = createSessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId: accountAssociationSession.userId,
			secretHash: sessionSecretHash,
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
