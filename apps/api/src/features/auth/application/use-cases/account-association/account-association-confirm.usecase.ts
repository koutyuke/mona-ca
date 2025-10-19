import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../../../shared/lib/id";
import { timingSafeStringEqual } from "../../../../../shared/lib/security";
import { createExternalIdentity } from "../../../domain/entities/external-identity";
import { createSession } from "../../../domain/entities/session";
import { newSessionId } from "../../../domain/value-objects/ids";
import { formatAnySessionToken } from "../../../domain/value-objects/session-token";

import type { UserId } from "../../../../../shared/domain/value-objects";
import type { ISessionSecretHasher } from "../../../../../shared/ports/system";
import type { AccountAssociationSession } from "../../../domain/entities/account-association-session";
import type { Session } from "../../../domain/entities/session";
import { type UserIdentity, updateUserIdentity } from "../../../domain/entities/user-identity";
import type { SessionToken } from "../../../domain/value-objects/session-token";
import type {
	AccountAssociationConfirmUseCaseResult,
	IAccountAssociationConfirmUseCase,
} from "../../contracts/account-association/account-association-confirm.usecase.interface";
import type { IAccountAssociationSessionRepository } from "../../ports/repositories/account-association-session.repository.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IExternalIdentityRepository } from "../../ports/repositories/external-identity.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

// this use case will be called after the validate account association session use case.
// so we don't need to check the expired account association session.
export class AccountAssociationConfirmUseCase implements IAccountAssociationConfirmUseCase {
	constructor(
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionRepository: ISessionRepository,
		private readonly externalIdentityRepository: IExternalIdentityRepository,
		private readonly accountAssociationSessionRepository: IAccountAssociationSessionRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
	) {}

	public async execute(
		code: string,
		userIdentity: UserIdentity,
		accountAssociationSession: AccountAssociationSession,
	): Promise<AccountAssociationConfirmUseCaseResult> {
		if (accountAssociationSession.code === null) {
			return err("INVALID_ASSOCIATION_CODE");
		}

		if (!timingSafeStringEqual(accountAssociationSession.code, code)) {
			return err("INVALID_ASSOCIATION_CODE");
		}

		await this.accountAssociationSessionRepository.deleteById(accountAssociationSession.id);

		const [existingExternalIdentity, currentUserExternalIdentity] = await Promise.all([
			this.externalIdentityRepository.findByProviderAndProviderUserId(
				accountAssociationSession.provider,
				accountAssociationSession.providerUserId,
			),
			this.externalIdentityRepository.findByUserIdAndProvider(
				accountAssociationSession.userId,
				accountAssociationSession.provider,
			),
		]);

		if (currentUserExternalIdentity) {
			return err("ACCOUNT_ALREADY_LINKED");
		}

		if (existingExternalIdentity) {
			return err("ACCOUNT_LINKED_ELSEWHERE");
		}

		const updatedUserIdentity = updateUserIdentity(userIdentity, {
			emailVerified: true,
		});

		const { session, sessionToken } = this.createSession(userIdentity.id);

		const externalIdentity = createExternalIdentity({
			provider: accountAssociationSession.provider,
			providerUserId: accountAssociationSession.providerUserId,
			userId: userIdentity.id,
		});

		await Promise.all([
			this.externalIdentityRepository.save(externalIdentity),
			this.sessionRepository.save(session),
			this.authUserRepository.update(updatedUserIdentity),
		]);

		return ok({
			session,
			sessionToken,
		});
	}

	private createSession(userId: UserId): {
		session: Session;
		sessionToken: SessionToken;
	} {
		const sessionSecret = this.sessionSecretHasher.generate();
		const sessionSecretHash = this.sessionSecretHasher.hash(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = formatAnySessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId,
			secretHash: sessionSecretHash,
		});
		return { session, sessionToken };
	}
}
