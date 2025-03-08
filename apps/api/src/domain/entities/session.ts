import { sessionRefreshSpan } from "../../common/constants";
import type { SessionId, UserId } from "../value-object";

export class Session {
	readonly id: SessionId;
	readonly userId: UserId;
	readonly expiresAt: Date;

	constructor(args: {
		id: SessionId;
		userId: UserId;
		expiresAt: Date;
	}) {
		this.id = args.id;
		this.userId = args.userId;
		this.expiresAt = args.expiresAt;
	}

	get isExpired() {
		return Date.now() >= this.expiresAt.getTime();
	}

	get shouldRefreshExpiration() {
		return Date.now() >= this.expiresAt.getTime() - sessionRefreshSpan.milliseconds();
	}
}
