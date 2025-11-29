import type { Ok, Result } from "@mona-ca/core/utils";
import type { UserId } from "../../../../../core/domain/value-objects";
import type { ProviderConnectionTicket } from "../../../domain/entities/provider-connection-ticket";
import type { ProviderConnectionTicketToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	providerConnectionTicket: ProviderConnectionTicket;
	providerConnectionTicketToken: ProviderConnectionTicketToken;
}>;

export type ProviderConnectionPrepareUseCaseResult = Result<Success>;

export interface IProviderConnectionPrepareUseCase {
	execute(userId: UserId): Promise<ProviderConnectionPrepareUseCaseResult>;
}
