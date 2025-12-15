import type { Ok, Result } from "@mona-ca/core/result";
import type { UserId } from "../../../../../core/domain/value-objects";
import type { ProviderLinkRequest } from "../../../domain/entities/provider-link-request";
import type { ProviderLinkRequestToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	providerLinkRequest: ProviderLinkRequest;
	providerLinkRequestToken: ProviderLinkRequestToken;
}>;

export type ProviderLinkPrepareUseCaseResult = Result<Success>;

export interface IProviderLinkPrepareUseCase {
	execute(userId: UserId): Promise<ProviderLinkPrepareUseCaseResult>;
}
