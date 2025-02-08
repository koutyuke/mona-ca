export class User {
	readonly id: string;
	readonly email: string;
	readonly emailVerified: boolean;
	readonly name: string;
	readonly iconUrl: string | null;
	readonly gender: "man" | "woman";
	readonly createdAt: Date;
	readonly updatedAt: Date;

	constructor(args: {
		id: string;
		email: string;
		emailVerified: boolean;
		name: string;
		iconUrl: string | null;
		gender: "man" | "woman";
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
