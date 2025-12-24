import type { UserId } from "../../../../core/domain/value-objects";
import type { IdentityProviders, IdentityProvidersUserId } from "../value-objects/identity-providers";

export interface ProviderAccount {
	provider: IdentityProviders;
	providerUserId: IdentityProvidersUserId;
	userId: UserId;
	linkedAt: Date;
}

export const createProviderAccount = (args: {
	provider: IdentityProviders;
	providerUserId: IdentityProvidersUserId;
	userId: UserId;
}): ProviderAccount => {
	const now = new Date();

	return {
		provider: args.provider,
		providerUserId: args.providerUserId,
		userId: args.userId,
		linkedAt: now,
	};
};
