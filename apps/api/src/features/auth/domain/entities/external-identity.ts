import type { UserId } from "../../../../shared/domain/value-objects";
import type { ExternalIdentityProvider, ExternalIdentityProviderUserId } from "../value-objects/external-identity";

export interface ExternalIdentity {
	provider: ExternalIdentityProvider;
	providerUserId: ExternalIdentityProviderUserId;
	userId: UserId;
	linkedAt: Date;
}

export const createExternalIdentity = (args: {
	provider: ExternalIdentityProvider;
	providerUserId: ExternalIdentityProviderUserId;
	userId: UserId;
}): ExternalIdentity => {
	const now = new Date();

	return {
		provider: args.provider,
		providerUserId: args.providerUserId,
		userId: args.userId,
		linkedAt: now,
	};
};
