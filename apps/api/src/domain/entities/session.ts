import type { SessionId, UserId } from "../value-object";

export class Session {
	readonly id: SessionId;
	readonly userId: UserId;
	readonly expiresAt: Date;
	readonly fresh: boolean;

	constructor(args: {
		id: SessionId;
		userId: UserId;
		expiresAt: Date;
		fresh?: boolean;
	}) {
		this.id = args.id;
		this.userId = args.userId;
		this.expiresAt = args.expiresAt;
		this.fresh = !!args.fresh;
	}

	get isExpired() {
		return Date.now() >= this.expiresAt.getTime();
	}
}
