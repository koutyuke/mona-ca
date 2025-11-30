import { ok } from "@mona-ca/core/utils";
import type { UserId } from "../../../../../core/domain/value-objects";
import { ulid } from "../../../../../core/lib/id";
import type { ITokenSecretService } from "../../../../../core/ports/system";
import {
	type ProviderConnectionTicket,
	createProviderConnectionTicket,
} from "../../../domain/entities/provider-connection-ticket";
import { newProviderConnectionTicketId } from "../../../domain/value-objects/ids";
import { type ProviderConnectionTicketToken, encodeToken } from "../../../domain/value-objects/tokens";
import type {
	IProviderConnectionPrepareUseCase,
	ProviderConnectionPrepareUseCaseResult,
} from "../../contracts/provider-connection/prepare.usecase.interface";
import type { IProviderConnectionTicketRepository } from "../../ports/repositories/provider-connection-ticket.repository.interface";

export class ProviderConnectionPrepareUseCase implements IProviderConnectionPrepareUseCase {
	constructor(
		// repositories
		private readonly providerConnectionTicketRepository: IProviderConnectionTicketRepository,
		// system
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(userId: UserId): Promise<ProviderConnectionPrepareUseCaseResult> {
		await this.providerConnectionTicketRepository.deleteByUserId(userId);

		const { providerConnectionTicket, providerConnectionTicketToken } = this.createProviderConnectionTicket(userId);

		await this.providerConnectionTicketRepository.save(providerConnectionTicket);

		return ok({
			providerConnectionTicket,
			providerConnectionTicketToken,
		});
	}

	private createProviderConnectionTicket(userId: UserId): {
		providerConnectionTicket: ProviderConnectionTicket;
		providerConnectionTicketToken: ProviderConnectionTicketToken;
	} {
		const id = newProviderConnectionTicketId(ulid());
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);

		const providerConnectionTicket = createProviderConnectionTicket({
			id,
			userId,
			secretHash,
		});
		const providerConnectionTicketToken = encodeToken(id, secret);
		return { providerConnectionTicket, providerConnectionTicketToken };
	}
}
