import { ok } from "@mona-ca/core/result";
import { ulid } from "../../../../../core/lib/id";
import { createProviderLinkRequest } from "../../../domain/entities/provider-link-request";
import { newProviderLinkRequestId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { ITokenSecretService } from "../../../../../core/ports/system";
import type { ProviderLinkRequest } from "../../../domain/entities/provider-link-request";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";
import type { ProviderLinkRequestToken } from "../../../domain/value-objects/tokens";
import type {
	IProviderLinkPrepareUseCase,
	ProviderLinkPrepareUseCaseResult,
} from "../../ports/in/provider-link/prepare.usecase.interface";
import type { IProviderLinkRequestRepository } from "../../ports/out/repositories/provider-link-request.repository.interface";

export class ProviderLinkPrepareUseCase implements IProviderLinkPrepareUseCase {
	constructor(
		// repositories
		private readonly providerLinkRequestRepository: IProviderLinkRequestRepository,
		// system
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(userId: UserId, provider: IdentityProviders): Promise<ProviderLinkPrepareUseCaseResult> {
		await this.providerLinkRequestRepository.deleteByUserId(userId);

		const { providerLinkRequest, providerLinkRequestToken } = this.createProviderLinkRequest(userId, provider);

		await this.providerLinkRequestRepository.save(providerLinkRequest);

		return ok({
			providerLinkRequest,
			providerLinkRequestToken,
		});
	}

	private createProviderLinkRequest(
		userId: UserId,
		provider: IdentityProviders,
	): {
		providerLinkRequest: ProviderLinkRequest;
		providerLinkRequestToken: ProviderLinkRequestToken;
	} {
		const id = newProviderLinkRequestId(ulid());
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);

		const providerLinkRequest = createProviderLinkRequest({
			id,
			userId,
			provider,
			secretHash,
		});
		const providerLinkRequestToken = encodeToken(id, secret);
		return { providerLinkRequest, providerLinkRequestToken };
	}
}
