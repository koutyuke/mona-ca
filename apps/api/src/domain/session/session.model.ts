export class Session {
	readonly id: string;
	readonly userId: string;
	readonly expiresAt: Date;
	readonly fresh: boolean;

	constructor(args: {
		id: string;
		userId: string;
		expiresAt: Date;
		fresh?: boolean;
	}) {
		this.id = args.id;
		this.userId = args.userId;
		this.expiresAt = args.expiresAt;
		this.fresh = !!args.fresh;
	}

	get isExpired() {
		return this.expiresAt < new Date();
	}
}
