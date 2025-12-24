import { ok } from "@mona-ca/core/result";
import { match } from "ts-pattern";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import {
	type IdentityProviders,
	isDiscordProvider,
	isGoogleProvider,
} from "../../../domain/value-objects/identity-providers";
import type {
	FederatedIdentities,
	IUserIdentitiesUseCase,
	PasswordIdentity,
	UserIdentitiesUseCaseResult,
} from "../../ports/in/session/user-identities.usecase.interface";
import type { IProviderAccountRepository } from "../../ports/out/repositories/provider-account.repository.interface";

export class UserIdentitiesUseCase implements IUserIdentitiesUseCase {
	constructor(
		// repositories
		private readonly providerAccountRepository: IProviderAccountRepository,
	) {}

	public async execute(userCredentials: UserCredentials): Promise<UserIdentitiesUseCaseResult> {
		const passwordIdentity: PasswordIdentity = {
			enabled: userCredentials.passwordHash !== null,
		};

		const externalIdentities = await this.providerAccountRepository.findByUserId(userCredentials.id);

		const order = (p: IdentityProviders) => {
			return match(p)
				.when(isGoogleProvider, () => 0)
				.when(isDiscordProvider, () => 1)
				.exhaustive();
		};

		const federatedIdentities: FederatedIdentities = externalIdentities
			.toSorted((a, b) => order(a.provider) - order(b.provider))
			.map(externalIdentity => ({
				provider: externalIdentity.provider,
				providerUserId: externalIdentity.providerUserId,
				linkedAt: externalIdentity.linkedAt,
			}));

		return ok({
			password: passwordIdentity,
			federated: federatedIdentities,
		});
	}
}
