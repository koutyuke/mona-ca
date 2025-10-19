import type { ToPrimitive } from "@mona-ca/core/utils";
import type { UserIdentity } from "../../../domain/entities/user-identity";
import type { ExternalIdentityProvider } from "../../../domain/value-objects/external-identity";
import type {
	AccountConnections,
	BasicAuthConnection,
	IGetConnectionsUseCase,
	ProviderConnections,
} from "../../contracts/account-link/get-connections.usecase.interface";
import type { IExternalIdentityRepository } from "../../ports/repositories/external-identity.repository.interface";

export class GetConnectionsUseCase implements IGetConnectionsUseCase {
	constructor(private readonly externalIdentityRepository: IExternalIdentityRepository) {}

	public async execute(userIdentity: UserIdentity): Promise<AccountConnections> {
		const basicAuthConnection: BasicAuthConnection = {
			password: userIdentity.passwordHash !== null,
		};
		const providerConnections: ProviderConnections = {
			discord: null,
			google: null,
		};

		const externalIdentities = await this.externalIdentityRepository.findByUserId(userIdentity.id);

		for (const externalIdentity of externalIdentities) {
			providerConnections[externalIdentity.provider as ToPrimitive<ExternalIdentityProvider>] = {
				provider: externalIdentity.provider,
				providerUserId: externalIdentity.providerUserId,
				linkedAt: externalIdentity.linkedAt,
			};
		}

		return {
			...basicAuthConnection,
			...providerConnections,
		};
	}
}
