import type { UserIdentities } from "../../application/ports/in/session/user-identities.usecase.interface";
import type { RawIdentityProviders } from "../../domain/value-objects/identity-providers";

type RawPasswordIdentity = {
	enabled: boolean;
};

type RawFederatedIdentities = {
	provider: RawIdentityProviders;
	providerUserId: string;
	linkedAt: string;
}[];

type RawUserIdentities = {
	password: RawPasswordIdentity;
	federated: RawFederatedIdentities;
};

export const toUserIdentitiesResponse = (userIdentities: UserIdentities): RawUserIdentities => {
	const { password, federated } = userIdentities;

	const formattedPassword: RawPasswordIdentity = {
		enabled: password.enabled,
	};

	const formattedFederated: RawFederatedIdentities = federated.map(identity => ({
		provider: identity.provider,
		providerUserId: identity.providerUserId,
		linkedAt: identity.linkedAt.toISOString(),
	}));

	return {
		password: formattedPassword,
		federated: formattedFederated,
	};
};
