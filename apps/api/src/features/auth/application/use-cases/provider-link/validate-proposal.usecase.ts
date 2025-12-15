import { err, ok } from "@mona-ca/core/result";
import { isExpiredProviderLinkProposal } from "../../../domain/entities/provider-link-proposal";
import { decodeToken } from "../../../domain/value-objects/tokens";

import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { ProviderLinkProposalToken } from "../../../domain/value-objects/tokens";
import type {
	IProviderLinkValidateProposalUseCase,
	ProviderLinkValidateProposalUseCaseResult,
} from "../../ports/in/provider-link/validate-proposal.usecase.interface";
import type { IAuthUserRepository } from "../../ports/out/repositories/auth-user.repository.interface";
import type { IProviderLinkProposalRepository } from "../../ports/out/repositories/provider-link-proposal.repository.interface";

export class ProviderLinkValidateProposalUseCase implements IProviderLinkValidateProposalUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly providerLinkProposalRepository: IProviderLinkProposalRepository,
		// infra
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(
		providerLinkProposalToken: ProviderLinkProposalToken,
	): Promise<ProviderLinkValidateProposalUseCaseResult> {
		const providerLinkProposalIdAndSecret = decodeToken(providerLinkProposalToken);

		if (!providerLinkProposalIdAndSecret) {
			return err("INVALID_PROVIDER_LINK_PROPOSAL");
		}

		const { id: providerLinkProposalId, secret: providerLinkProposalSecret } = providerLinkProposalIdAndSecret;

		const providerLinkProposal = await this.providerLinkProposalRepository.findById(providerLinkProposalId);

		if (!providerLinkProposal) {
			return err("INVALID_PROVIDER_LINK_PROPOSAL");
		}

		if (!this.tokenSecretService.verify(providerLinkProposalSecret, providerLinkProposal.secretHash)) {
			return err("INVALID_PROVIDER_LINK_PROPOSAL");
		}

		if (isExpiredProviderLinkProposal(providerLinkProposal)) {
			await this.providerLinkProposalRepository.deleteById(providerLinkProposalId);
			return err("EXPIRED_PROVIDER_LINK_PROPOSAL");
		}

		const userCredentials = await this.authUserRepository.findById(providerLinkProposal.userId);

		if (!userCredentials || userCredentials.email !== providerLinkProposal.email) {
			await this.providerLinkProposalRepository.deleteById(providerLinkProposalId);
			return err("INVALID_PROVIDER_LINK_PROPOSAL");
		}

		return ok({ providerLinkProposal, userCredentials });
	}
}
