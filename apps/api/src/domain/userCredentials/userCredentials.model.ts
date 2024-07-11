import type { User } from "../user";

export class UserCredentials {
	readonly userId: User["id"];
	readonly hashedPassword: string | null;
	constructor(args: {
		userId: string;
		hashedPassword: string | null;
	}) {
		this.userId = args.userId;
		this.hashedPassword = args.hashedPassword;
	}
}
