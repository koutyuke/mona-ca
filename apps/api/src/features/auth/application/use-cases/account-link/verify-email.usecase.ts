import { err, ok } from "@mona-ca/core/result";
import { ulid } from "../../../../../core/lib/id";
import { timingSafeStringEqual } from "../../../../../core/lib/security";
import { createProviderAccount } from "../../../domain/entities/provider-account";
import { createSession } from "../../../domain/entities/session";
import { updateUserCredentials } from "../../../domain/entities/user-credentials";
import { newSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { AccountLinkRequest } from "../../../domain/entities/account-link-request";
import type { Session } from "../../../domain/entities/session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { SessionToken } from "../../../domain/value-objects/tokens";
import type {
	AccountLinkVerifyEmailUseCaseResult,
	IAccountLinkVerifyEmailUseCase,
} from "../../ports/in/account-link/verify-email.usecase.interface";
import type { IAccountLinkRequestRepository } from "../../ports/out/repositories/account-link-request.repository.interface";
import type { IAuthUserRepository } from "../../ports/out/repositories/auth-user.repository.interface";
import type { IProviderAccountRepository } from "../../ports/out/repositories/provider-account.repository.interface";
import type { ISessionRepository } from "../../ports/out/repositories/session.repository.interface";

// this use case will be called after the validate account link request use case.
// so we don't need to check the expired account link request.
export class AccountLinkVerifyEmailUseCase implements IAccountLinkVerifyEmailUseCase {
	constructor(
		// repositories
		private readonly accountLinkRequestRepository: IAccountLinkRequestRepository,
		private readonly authUserRepository: IAuthUserRepository,
		private readonly providerAccountRepository: IProviderAccountRepository,
		private readonly sessionRepository: ISessionRepository,
		// infra
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(
		code: string,
		userCredentials: UserCredentials,
		accountLinkRequest: AccountLinkRequest,
	): Promise<AccountLinkVerifyEmailUseCaseResult> {
		if (accountLinkRequest.code === null) {
			return err("INVALID_CODE");
		}

		if (!timingSafeStringEqual(accountLinkRequest.code, code)) {
			return err("INVALID_CODE");
		}

		await this.accountLinkRequestRepository.deleteById(accountLinkRequest.id);

		const [existingProviderAccount, currentUserProviderAccount] = await Promise.all([
			this.providerAccountRepository.findByProviderAndProviderUserId(
				accountLinkRequest.provider,
				accountLinkRequest.providerUserId,
			),
			this.providerAccountRepository.findByUserIdAndProvider(accountLinkRequest.userId, accountLinkRequest.provider),
		]);

		if (currentUserProviderAccount) {
			return err("PROVIDER_ALREADY_LINKED");
		}

		if (existingProviderAccount) {
			return err("ACCOUNT_LINKED_ELSEWHERE");
		}

		const updatedUserCredentials = updateUserCredentials(userCredentials, {
			emailVerified: true,
		});

		const { session, sessionToken } = this.createSession(userCredentials.id);

		const providerAccount = createProviderAccount({
			provider: accountLinkRequest.provider,
			providerUserId: accountLinkRequest.providerUserId,
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
			id,
			userId,
			secretHash,
		});
		const sessionToken = encodeToken(id, secret);
		return { session, sessionToken };
	}
}
