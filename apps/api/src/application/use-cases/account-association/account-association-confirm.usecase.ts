import { err, timingSafeStringEqual, ulid } from "../../../common/utils";
import {
	type AccountAssociationSession,
	type Session,
	createOAuthAccount,
	createSession,
	updateUser,
} from "../../../domain/entities";
import { type SessionToken, type UserId, formatSessionToken, newSessionId } from "../../../domain/value-object";
import type { AccountAssociationConfirmUseCaseResult, IAccountAssociationConfirmUseCase } from "../../ports/in";
import type {
	IAccountAssociationSessionRepository,
	IOAuthAccountRepository,
	ISessionRepository,
	IUserRepository,
} from "../../ports/out/repositories";
import type { ISessionSecretHasher } from "../../ports/out/system";

// this use case will be called after the validate account association session use case.
// so we don't need to check the expired account association session.
export class AccountAssociationConfirmUseCase implements IAccountAssociationConfirmUseCase {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly oauthAccountRepository: IOAuthAccountRepository,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
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

		const { session, sessionToken } = this.createSession(user.id);

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

	private createSession(userId: UserId): {
		session: Session;
		sessionToken: SessionToken;
	} {
		const sessionSecret = this.sessionSecretHasher.generate();
		const sessionSecretHash = this.sessionSecretHasher.hash(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = formatSessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId,
			secretHash: sessionSecretHash,
		});
		return { session, sessionToken };
	}
}
