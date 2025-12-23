import { ok } from "@mona-ca/core/result";
import type { Unbrand } from "@mona-ca/core/types";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { IdentityProviders } from "../../../domain/value-objects/identity-providers";
import type {
	FederatedIdentityMap,
	IUserIdentitiesUseCase,
	PasswordIdentities,
	UserIdentitiesUseCaseResult,
} from "../../ports/in/session/user-identities.usecase.interface";
import type { IProviderAccountRepository } from "../../ports/out/repositories/provider-account.repository.interface";

export class UserIdentitiesUseCase implements IUserIdentitiesUseCase {
	constructor(
		// repositories
		private readonly providerAccountRepository: IProviderAccountRepository,
	) {}

	public async execute(userCredentials: UserCredentials): Promise<UserIdentitiesUseCaseResult> {
		const passwordIdentity: PasswordIdentities = {
			enabled: userCredentials.passwordHash !== null,
		};
		const federatedIdentities: FederatedIdentityMap = {
			discord: null,
			google: null,
		};

		const externalIdentities = await this.providerAccountRepository.findByUserId(userCredentials.id);

		for (const externalIdentity of externalIdentities) {
			federatedIdentities[externalIdentity.provider as Unbrand<IdentityProviders>] = {
				provider: externalIdentity.provider,
				providerUserId: externalIdentity.providerUserId,
				linkedAt: externalIdentity.linkedAt,
			};
		}

		return ok({
			password: passwordIdentity,
			federated: federatedIdentities,
		});
	}
}
