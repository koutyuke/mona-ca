export type OAuthProvider = "google" | "discord" | "line";

export class OAuthAccount {
	readonly provider: OAuthProvider;
	readonly providerId: string;
	readonly userId: string;

	constructor(args: {
		provider: OAuthProvider;
		providerId: string;
		userId: string;
	}) {
		this.provider = args.provider;
		this.providerId = args.providerId;
		this.userId = args.userId;
	}
}
