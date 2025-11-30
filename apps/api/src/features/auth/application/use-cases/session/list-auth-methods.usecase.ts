import { type Unbrand, ok } from "@mona-ca/core/utils";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";
import type {
	FederatedConnections,
	IListAuthMethodsUseCase,
	ListAuthMethodsUseCaseResult,
	PasswordAuthConnection,
} from "../../contracts/session/list-auth-methods.usecase.interface";
import type { IProviderAccountRepository } from "../../ports/repositories/provider-account.repository.interface";

export class ListAuthMethodsUseCase implements IListAuthMethodsUseCase {
	constructor(
		// repositories
		private readonly providerAccountRepository: IProviderAccountRepository,
	) {}

	public async execute(userCredentials: UserCredentials): Promise<ListAuthMethodsUseCaseResult> {
		const passwordAuthConnection: PasswordAuthConnection = {
			enabled: userCredentials.passwordHash !== null,
		};
		const federatedConnections: FederatedConnections = {
			discord: null,
			google: null,
		};

		const externalIdentities = await this.providerAccountRepository.findByUserId(userCredentials.id);

		for (const externalIdentity of externalIdentities) {
			federatedConnections[externalIdentity.provider as Unbrand<IdentityProviders>] = {
				provider: externalIdentity.provider,
				providerUserId: externalIdentity.providerUserId,
				linkedAt: externalIdentity.linkedAt,
			};
		}

		return ok({
			password: passwordAuthConnection,
			federated: federatedConnections,
		});
	}
}
