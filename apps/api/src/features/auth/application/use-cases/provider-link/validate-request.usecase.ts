import { err, ok } from "@mona-ca/core/result";
import type { ITokenSecretService } from "../../../../../core/ports/system";
import { isExpiredProviderLinkRequest } from "../../../domain/entities/provider-link-request";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";
import { type ProviderLinkRequestToken, decodeToken } from "../../../domain/value-objects/tokens";
import type {
	IProviderLinkValidateRequestUseCase,
	ProviderLinkValidateRequestUseCaseResult,
} from "../../ports/in/provider-link/validate-request.usecase.interface";
import type { IAuthUserRepository } from "../../ports/out/repositories/auth-user.repository.interface";
import type { IProviderLinkRequestRepository } from "../../ports/out/repositories/provider-link-request.repository.interface";

export class ProviderLinkValidateRequestUseCase implements IProviderLinkValidateRequestUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly providerLinkRequestRepository: IProviderLinkRequestRepository,
		// system
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	async execute(
		provider: IdentityProviders,
		providerLinkRequestToken: ProviderLinkRequestToken,
	): Promise<ProviderLinkValidateRequestUseCaseResult> {
		const idAndSecret = decodeToken(providerLinkRequestToken);
		if (!idAndSecret) {
			return err("INVALID_PROVIDER_LINK_REQUEST");
		}

		const { id: providerLinkRequestId, secret: providerLinkRequestSecret } = idAndSecret;

		const providerLinkRequest = await this.providerLinkRequestRepository.findById(providerLinkRequestId);
		if (!providerLinkRequest) {
			return err("INVALID_PROVIDER_LINK_REQUEST");
		}

		await this.providerLinkRequestRepository.deleteById(providerLinkRequestId);

		if (!this.tokenSecretService.verify(providerLinkRequestSecret, providerLinkRequest.secretHash)) {
			return err("INVALID_PROVIDER_LINK_REQUEST");
		}

		if (isExpiredProviderLinkRequest(providerLinkRequest)) {
			return err("EXPIRED_PROVIDER_LINK_REQUEST");
		}

		if (providerLinkRequest.provider !== provider) {
			return err("INVALID_PROVIDER_LINK_REQUEST");
		}

		const userCredentials = await this.authUserRepository.findById(providerLinkRequest.userId);

		if (!userCredentials) {
			return err("INVALID_PROVIDER_LINK_REQUEST");
		}

		return ok({ userCredentials });
	}
}
