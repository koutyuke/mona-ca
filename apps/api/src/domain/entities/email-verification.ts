import type { EmailVerificationId, UserId } from "../value-object";

export class EmailVerification {
	readonly id: EmailVerificationId;
	readonly email: string;
	readonly userId: UserId;
	readonly code: string;
	readonly expiresAt: Date;

	constructor(args: {
		id: EmailVerificationId;
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
