import type { OAuthProvider, OAuthProviderId, UserId } from "../value-object";

export class OAuthAccount {
	readonly provider: OAuthProvider;
	readonly providerId: OAuthProviderId;
	readonly userId: UserId;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	constructor(args: {
		provider: OAuthProvider;
		providerId: OAuthProviderId;
		userId: UserId;
		createdAt: Date;
		updatedAt: Date;
	}) {
		this.provider = args.provider;
		this.providerId = args.providerId;
		this.userId = args.userId;
		this.createdAt = args.createdAt;
		this.updatedAt = args.updatedAt;
	}
}
