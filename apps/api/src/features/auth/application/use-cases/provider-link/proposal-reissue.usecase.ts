import { ok } from "@mona-ca/core/result";
import { ulid } from "../../../../../core/lib/id";
import { createProviderLinkProposal } from "../../../domain/entities/provider-link-proposal";
import { newProviderLinkProposalId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IEmailGateway } from "../../../../../core/ports/gateways";
import type { ICryptoRandomService, ITokenSecretService } from "../../../../../core/ports/system";
import type { ProviderLinkProposal } from "../../../domain/entities/provider-link-proposal";
import type { IdentityProviders, IdentityProvidersUserId } from "../../../domain/value-objects/identity-providers";
import type { ProviderLinkProposalToken } from "../../../domain/value-objects/tokens";
import type {
	IProviderLinkProposalReissueUseCase,
	ProviderLinkProposalReissueUseCaseResult,
} from "../../contracts/provider-link/proposal-reissue.usecase.interface";
import type { IProviderLinkProposalRepository } from "../../ports/repositories/provider-link-proposal.repository.interface";

// this use case will be called after the validate provider link proposal use case.
// so we don't need to check the expired provider link proposal.
export class ProviderLinkProposalReissueUseCase implements IProviderLinkProposalReissueUseCase {
	constructor(
		// gateways
		private readonly emailGateway: IEmailGateway,
		// repositories
		private readonly providerLinkProposalRepository: IProviderLinkProposalRepository,
		// infra
		private readonly cryptoRandomService: ICryptoRandomService,
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(
		oldProviderLinkProposal: ProviderLinkProposal,
	): Promise<ProviderLinkProposalReissueUseCaseResult> {
		await this.providerLinkProposalRepository.deleteByUserId(oldProviderLinkProposal.userId);

		const { providerLinkProposal, providerLinkProposalToken } = this.createProviderLinkProposal(
			oldProviderLinkProposal.userId,
			oldProviderLinkProposal.email,
			oldProviderLinkProposal.provider,
			oldProviderLinkProposal.providerUserId,
		);

		await Promise.all([
			this.providerLinkProposalRepository.save(providerLinkProposal),
			this.emailGateway.sendVerificationEmail(providerLinkProposal.email, providerLinkProposal.code ?? ""),
		]);

		return ok({
			providerLinkProposal,
			providerLinkProposalToken,
		});
	}

	private createProviderLinkProposal(
		userId: UserId,
		email: string,
		provider: IdentityProviders,
		providerUserId: IdentityProvidersUserId,
	): {
		providerLinkProposal: ProviderLinkProposal;
		providerLinkProposalToken: ProviderLinkProposalToken;
	} {
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);
		const id = newProviderLinkProposalId(ulid());
		const code = this.cryptoRandomService.string(8, { digits: true });

		const providerLinkProposal = createProviderLinkProposal({
			id,
			userId,
			code,
			email,
			provider,
			providerUserId,
			secretHash,
		});
		const providerLinkProposalToken = encodeToken(id, secret);

		return { providerLinkProposal, providerLinkProposalToken };
	}
}
