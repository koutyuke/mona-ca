import type { Gender } from "../value-object/gender";
import type { UserId } from "../value-object/ids";

export class User {
	readonly id: UserId;
	readonly email: string;
	readonly emailVerified: boolean;
	readonly name: string;
	readonly iconUrl: string | null;
	readonly gender: Gender;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	constructor(args: {
		id: UserId;
		email: string;
		emailVerified: boolean;
		name: string;
		iconUrl: string | null;
		gender: Gender;
		createdAt: Date;
		updatedAt: Date;
	}) {
		this.id = args.id;
		this.email = args.email;
		this.emailVerified = args.emailVerified;
		this.name = args.name;
		this.iconUrl = args.iconUrl;
		this.gender = args.gender;
		this.createdAt = args.createdAt;
		this.updatedAt = args.updatedAt;
	}
}
