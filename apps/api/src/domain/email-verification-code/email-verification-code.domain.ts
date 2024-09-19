export class EmailVerificationCode {
	readonly id: string;
	readonly email: string;
	readonly code: string;
	readonly expiresAt: Date;
	readonly userId: string;

	constructor(args: {
		id: string;
		email: string;
		userId: string;
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
