import { err, ok } from "@mona-ca/core/utils";
import type { ITokenSecretService } from "../../../../../core/ports/system";
import { isExpiredProviderConnectionTicket } from "../../../domain/entities/provider-connection-ticket";
import { type ProviderConnectionTicketToken, decodeToken } from "../../../domain/value-objects/tokens";
import type {
	IProviderConnectionValidateTicketUseCase,
	ProviderConnectionValidateTicketUseCaseResult,
} from "../../contracts/provider-connection/validate-ticket.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { IProviderConnectionTicketRepository } from "../../ports/repositories/provider-connection-ticket.repository.interface";

export class ProviderConnectionValidateTicketUseCase implements IProviderConnectionValidateTicketUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly providerConnectionTicketRepository: IProviderConnectionTicketRepository,
		// system
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	async execute(
		providerConnectionTicketToken: ProviderConnectionTicketToken,
	): Promise<ProviderConnectionValidateTicketUseCaseResult> {
		const idAndSecret = decodeToken(providerConnectionTicketToken);
		if (!idAndSecret) {
			return err("PROVIDER_CONNECTION_TICKET_INVALID");
		}

		const { id: providerConnectionTicketId, secret: providerConnectionTicketSecret } = idAndSecret;

		const providerConnectionTicket = await this.providerConnectionTicketRepository.findById(providerConnectionTicketId);
		if (!providerConnectionTicket) {
			return err("PROVIDER_CONNECTION_TICKET_INVALID");
		}

		await this.providerConnectionTicketRepository.deleteById(providerConnectionTicketId);

		if (!this.tokenSecretService.verify(providerConnectionTicketSecret, providerConnectionTicket.secretHash)) {
			return err("PROVIDER_CONNECTION_TICKET_INVALID");
		}

		if (isExpiredProviderConnectionTicket(providerConnectionTicket)) {
			return err("PROVIDER_CONNECTION_TICKET_EXPIRED");
		}

		const userCredentials = await this.authUserRepository.findById(providerConnectionTicket.userId);

		if (!userCredentials) {
			return err("PROVIDER_CONNECTION_TICKET_INVALID");
		}

		return ok({ userCredentials });
	}
}
