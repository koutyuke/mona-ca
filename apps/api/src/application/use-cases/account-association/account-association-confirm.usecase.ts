import { err, timingSafeStringEqual, ulid } from "../../../common/utils";
import {
	type AccountAssociationSession,
	createOAuthAccount,
	createSession,
	updateUser,
} from "../../../domain/entities";
import { newSessionId } from "../../../domain/value-object";
import type { IAccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import type { IOAuthAccountRepository } from "../../../interface-adapter/repositories/oauth-account";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import { type ISessionSecretService, createSessionToken } from "../../services/session";
import type {
	AccountAssociationConfirmUseCaseResult,
	IAccountAssociationConfirmUseCase,
} from "./interfaces/account-association-confirm.interface.usecase";

// this use case will be called after the validate account association session use case.
// so we don't need to check the expired account association session.
export class AccountAssociationConfirmUseCase implements IAccountAssociationConfirmUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
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
			return err("INVALID_ASSOCIATION_CODE");
		}

		if (!timingSafeStringEqual(accountAssociationSession.code, code)) {
			return err("INVALID_ASSOCIATION_CODE");
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
			return err("OAUTH_PROVIDER_ALREADY_LINKED");
		}

		if (existingOAuthAccount) {
			return err("OAUTH_ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER");
		}

		const _user = await this.userRepository.findById(accountAssociationSession.userId);
		if (!_user) {
			return err("USER_NOT_FOUND");
		}

		const user = updateUser(_user, {
			emailVerified: true,
		});

		const sessionSecret = this.sessionTokenService.generateSessionSecret();
		const sessionSecretHash = this.sessionTokenService.hashSessionSecret(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = createSessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId: user.id,
			secretHash: sessionSecretHash,
		});

		const oauthAccount = createOAuthAccount({
			provider: accountAssociationSession.provider,
			providerId: accountAssociationSession.providerId,
			userId: user.id,
		});

		await Promise.all([
			this.oauthAccountRepository.save(oauthAccount),
			this.sessionRepository.save(session),
			this.userRepository.save(user),
		]);

		return {
			session,
			sessionToken,
		};
	}
}
