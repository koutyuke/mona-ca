import type { User } from "../user";

export class UserCredential {
	readonly userId: User["id"];
	readonly passwordHash: string | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	constructor(args: {
		userId: string;
		passwordHash: string | null;
		createdAt: Date;
		updatedAt: Date;
	}) {
		this.userId = args.userId;
		this.passwordHash = args.passwordHash;
		this.createdAt = args.createdAt;
		this.updatedAt = args.updatedAt;
	}
}
