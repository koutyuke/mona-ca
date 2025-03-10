import type { EmailVerificationSessionId, UserId } from "../value-object";

export class EmailVerificationSession {
	readonly id: EmailVerificationSessionId;
	readonly email: string;
	readonly userId: UserId;
	readonly code: string;
	readonly expiresAt: Date;

	constructor(args: {
		id: EmailVerificationSessionId;
		email: string;
		userId: UserId;
		code: string;
		expiresAt: Date;
	}) {
		this.id = args.id;
		this.email = args.email;
		this.code = args.code;
		this.expiresAt = args.expiresAt;
		this.userId = args.userId;
	}

	get isExpired() {
		return this.expiresAt < new Date();
	}
}
