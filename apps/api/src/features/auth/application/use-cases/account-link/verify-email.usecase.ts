import { err, ok } from "@mona-ca/core/result";
import { ulid } from "../../../../../core/lib/id";
import { timingSafeStringEqual } from "../../../../../core/lib/security";
import { createProviderAccount } from "../../../domain/entities/provider-account";
import { createSession } from "../../../domain/entities/session";
import { newSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { AccountLinkSession } from "../../../domain/entities/account-link-session";
import type { Session } from "../../../domain/entities/session";
import { type UserCredentials, updateUserCredentials } from "../../../domain/entities/user-credentials";
import type { SessionToken } from "../../../domain/value-objects/tokens";
import type {
	AccountLinkVerifyEmailUseCaseResult,
	IAccountLinkVerifyEmailUseCase,
} from "../../contracts/account-link/verify-email.usecase.interface";
import type { IAccountLinkSessionRepository } from "../../ports/repositories/account-link-session.repository.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IProviderAccountRepository } from "../../ports/repositories/provider-account.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

// this use case will be called after the validate account association session use case.
// so we don't need to check the expired account association session.
export class AccountLinkVerifyEmailUseCase implements IAccountLinkVerifyEmailUseCase {
	constructor(
		// repositories
		private readonly accountLinkSessionRepository: IAccountLinkSessionRepository,
		private readonly authUserRepository: IAuthUserRepository,
		private readonly providerAccountRepository: IProviderAccountRepository,
		private readonly sessionRepository: ISessionRepository,
		// infra
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(
		code: string,
		userCredentials: UserCredentials,
		accountLinkSession: AccountLinkSession,
	): Promise<AccountLinkVerifyEmailUseCaseResult> {
		if (accountLinkSession.code === null) {
			return err("INVALID_ASSOCIATION_CODE");
		}

		if (!timingSafeStringEqual(accountLinkSession.code, code)) {
			return err("INVALID_ASSOCIATION_CODE");
		}

		await this.accountLinkSessionRepository.deleteById(accountLinkSession.id);

		const [existingProviderAccount, currentUserProviderAccount] = await Promise.all([
			this.providerAccountRepository.findByProviderAndProviderUserId(
				accountLinkSession.provider,
				accountLinkSession.providerUserId,
			),
			this.providerAccountRepository.findByUserIdAndProvider(accountLinkSession.userId, accountLinkSession.provider),
		]);

		if (currentUserProviderAccount) {
			return err("ACCOUNT_ALREADY_LINKED");
		}

		if (existingProviderAccount) {
			return err("ACCOUNT_LINKED_ELSEWHERE");
		}

		const updatedUserCredentials = updateUserCredentials(userCredentials, {
			emailVerified: true,
		});

		const { session, sessionToken } = this.createSession(userCredentials.id);

		const providerAccount = createProviderAccount({
			provider: accountLinkSession.provider,
			providerUserId: accountLinkSession.providerUserId,
			userId: userCredentials.id,
		});

		await Promise.all([
			this.providerAccountRepository.save(providerAccount),
			this.sessionRepository.save(session),
			this.authUserRepository.update(updatedUserCredentials),
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
		const id = newSessionId(ulid());
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);

		const session = createSession({
			id: id,
			userId,
			secretHash,
		});
		const sessionToken = encodeToken(id, secret);
		return { session, sessionToken };
	}
}
