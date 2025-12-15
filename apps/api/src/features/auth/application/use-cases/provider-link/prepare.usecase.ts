import { ok } from "@mona-ca/core/result";
import type { UserId } from "../../../../../core/domain/value-objects";
import { ulid } from "../../../../../core/lib/id";
import type { ITokenSecretService } from "../../../../../core/ports/system";
import { type ProviderLinkRequest, createProviderLinkRequest } from "../../../domain/entities/provider-link-request";
import { newProviderLinkRequestId } from "../../../domain/value-objects/ids";
import { type ProviderLinkRequestToken, encodeToken } from "../../../domain/value-objects/tokens";
import type {
	IProviderLinkPrepareUseCase,
	ProviderLinkPrepareUseCaseResult,
} from "../../contracts/provider-link/prepare.usecase.interface";
import type { IProviderLinkRequestRepository } from "../../ports/repositories/provider-link-request.repository.interface";

export class ProviderLinkPrepareUseCase implements IProviderLinkPrepareUseCase {
	constructor(
		// repositories
		private readonly providerLinkRequestRepository: IProviderLinkRequestRepository,
		// system
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(userId: UserId): Promise<ProviderLinkPrepareUseCaseResult> {
		await this.providerLinkRequestRepository.deleteByUserId(userId);

		const { providerLinkRequest, providerLinkRequestToken } = this.createProviderLinkRequest(userId);

		await this.providerLinkRequestRepository.save(providerLinkRequest);

		return ok({
			providerLinkRequest,
			providerLinkRequestToken,
		});
	}

	private createProviderLinkRequest(userId: UserId): {
		providerLinkRequest: ProviderLinkRequest;
		providerLinkRequestToken: ProviderLinkRequestToken;
	} {
		const id = newProviderLinkRequestId(ulid());
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);

		const providerLinkRequest = createProviderLinkRequest({
			id,
			userId,
			secretHash,
		});
		const providerLinkRequestToken = encodeToken(id, secret);
		return { providerLinkRequest, providerLinkRequestToken };
	}
}
