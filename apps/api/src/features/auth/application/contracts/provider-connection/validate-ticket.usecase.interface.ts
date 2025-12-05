import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { ProviderConnectionTicketToken } from "../../../domain/value-objects/tokens";

type Success = Ok<{
	userCredentials: UserCredentials;
}>;

type Error = Err<"PROVIDER_CONNECTION_TICKET_INVALID" | "PROVIDER_CONNECTION_TICKET_EXPIRED">;

export type ProviderConnectionValidateTicketUseCaseResult = Result<Success, Error>;

export interface IProviderConnectionValidateTicketUseCase {
	execute(
		providerConnectionTicketToken: ProviderConnectionTicketToken,
	): Promise<ProviderConnectionValidateTicketUseCaseResult>;
}
