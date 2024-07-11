import type { OAuthProvider } from "@/interfaceAdapter/gateway/oAuthProvider";

export class OAuthAccount {
	readonly provider: OAuthProvider;
	readonly providerId: string;
	readonly userId: string;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	constructor(args: {
		provider: OAuthProvider;
		providerId: string;
		userId: string;
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
