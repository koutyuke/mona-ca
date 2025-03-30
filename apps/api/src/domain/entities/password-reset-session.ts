import type { PasswordResetSessionId, UserId } from "../value-object";

export class PasswordResetSession {
	readonly id: PasswordResetSessionId;
	readonly userId: UserId;
	readonly code: string;
	readonly email: string;
	readonly emailVerified: boolean;
	readonly expiresAt: Date;

	constructor(args: {
		id: PasswordResetSessionId;
		userId: UserId;
		code: string;
		email: string;
		emailVerified: boolean;
		expiresAt: Date;
	}) {
		this.id = args.id;
		this.userId = args.userId;
		this.code = args.code;
		this.email = args.email;
		this.emailVerified = args.emailVerified;
		this.expiresAt = args.expiresAt;
	}

	get isExpired() {
		return this.expiresAt < new Date();
	}
}
