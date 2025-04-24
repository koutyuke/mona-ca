import type { OAuthProvider, OAuthProviderId, UserId } from "../value-object";

export interface OAuthAccount {
	provider: OAuthProvider;
	providerId: OAuthProviderId;
	userId: UserId;
	linkedAt: Date;
}

export const createOAuthAccount = (args: {
	provider: OAuthProvider;
	providerId: OAuthProviderId;
	userId: UserId;
}): OAuthAccount => {
	const now = new Date();

	return {
		provider: args.provider,
		providerId: args.providerId,
		userId: args.userId,
		linkedAt: now,
	};
};
