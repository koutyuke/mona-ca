import { ok } from "@mona-ca/core/result";
import { ulid } from "../../../../../core/lib/id";
import { createAccountLinkRequest } from "../../../domain/entities/account-link-request";
import { newAccountLinkRequestId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IEmailGateway } from "../../../../../core/ports/gateways";
import type { ICryptoRandomService, ITokenSecretService } from "../../../../../core/ports/system";
import type { AccountLinkRequest } from "../../../domain/entities/account-link-request";
import type { IdentityProviders, IdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";
import type { AccountLinkRequestToken } from "../../../domain/value-objects/tokens";
import type {
	AccountLinkReissueUseCaseResult,
	IAccountLinkReissueUseCase,
} from "../../ports/in/account-link/reissue.usecase.interface";
import type { IAccountLinkRequestRepository } from "../../ports/out/repositories/account-link-request.repository.interface";

// this use case will be called after the validate account link request use case.
// so we don't need to check the expired account link request.
export class AccountLinkReissueUseCase implements IAccountLinkReissueUseCase {
	constructor(
		// gateways
		private readonly emailGateway: IEmailGateway,
		// repositories
		private readonly accountLinkRequestRepository: IAccountLinkRequestRepository,
		// infra
		private readonly cryptoRandomService: ICryptoRandomService,
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(oldAccountLinkRequest: AccountLinkRequest): Promise<AccountLinkReissueUseCaseResult> {
		await this.accountLinkRequestRepository.deleteByUserId(oldAccountLinkRequest.userId);

		const { accountLinkRequest, accountLinkRequestToken } = this.createAccountLinkRequest(
			oldAccountLinkRequest.userId,
			oldAccountLinkRequest.email,
			oldAccountLinkRequest.provider,
			oldAccountLinkRequest.providerUserId,
		);

		await Promise.all([
			this.accountLinkRequestRepository.save(accountLinkRequest),
			this.emailGateway.sendVerificationEmail(accountLinkRequest.email, accountLinkRequest.code ?? ""),
		]);

		return ok({
			accountLinkRequest,
			accountLinkRequestToken,
		});
	}

	private createAccountLinkRequest(
		userId: UserId,
		email: string,
		provider: IdentityProviders,
		providerUserId: IdentityProvidersUserId,
	): {
		accountLinkRequest: AccountLinkRequest;
		accountLinkRequestToken: AccountLinkRequestToken;
	} {
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);
		const id = newAccountLinkRequestId(ulid());
		const code = this.cryptoRandomService.string(8, { digits: true });

		const accountLinkRequest = createAccountLinkRequest({
			id,
			userId,
			code,
			email,
			provider,
			providerUserId,
			secretHash,
		});
		const accountLinkRequestToken = encodeToken(id, secret);

		return { accountLinkRequest, accountLinkRequestToken };
	}
}
