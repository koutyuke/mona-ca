import { ok } from "@mona-ca/core/result";
import { ulid } from "../../../../../core/lib/id";
import { createAccountLinkSession } from "../../../domain/entities/account-link-session";
import { newAccountLinkSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IEmailGateway } from "../../../../../core/ports/gateways";
import type { ICryptoRandomService, ITokenSecretService } from "../../../../../core/ports/system";
import type { AccountLinkSession } from "../../../domain/entities/account-link-session";
import type { IdentityProviders, IdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";
import type { AccountLinkSessionToken } from "../../../domain/value-objects/tokens";
import type {
	AccountLinkReissueSessionUseCaseResult,
	IAccountLinkReissueSessionUseCase,
} from "../../contracts/account-link/reissue-session.usecase.interface";
import type { IAccountLinkSessionRepository } from "../../ports/repositories/account-link-session.repository.interface";

// this use case will be called after the validate account association session use case.
// so we don't need to check the expired account association session.
export class AccountLinkReissueSessionUseCase implements IAccountLinkReissueSessionUseCase {
	constructor(
		// gateways
		private readonly emailGateway: IEmailGateway,
		// repositories
		private readonly accountLinkSessionRepository: IAccountLinkSessionRepository,
		// infra
		private readonly cryptoRandomService: ICryptoRandomService,
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(oldAccountLinkSession: AccountLinkSession): Promise<AccountLinkReissueSessionUseCaseResult> {
		await this.accountLinkSessionRepository.deleteByUserId(oldAccountLinkSession.userId);

		const { accountLinkSession, accountLinkSessionToken } = this.createAccountLinkSession(
			oldAccountLinkSession.userId,
			oldAccountLinkSession.email,
			oldAccountLinkSession.provider,
			oldAccountLinkSession.providerUserId,
		);

		await Promise.all([
			this.accountLinkSessionRepository.save(accountLinkSession),
			this.emailGateway.sendVerificationEmail(accountLinkSession.email, accountLinkSession.code ?? ""),
		]);

		return ok({
			accountLinkSession,
			accountLinkSessionToken,
		});
	}

	private createAccountLinkSession(
		userId: UserId,
		email: string,
		provider: IdentityProviders,
		providerUserId: IdentityProvidersUserId,
	): {
		accountLinkSession: AccountLinkSession;
		accountLinkSessionToken: AccountLinkSessionToken;
	} {
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);
		const id = newAccountLinkSessionId(ulid());
		const code = this.cryptoRandomService.string(8, { digits: true });

		const accountLinkSession = createAccountLinkSession({
			id,
			userId,
			code,
			email,
			provider,
			providerUserId,
			secretHash,
		});
		const accountLinkSessionToken = encodeToken(id, secret);

		return { accountLinkSession, accountLinkSessionToken };
	}
}
