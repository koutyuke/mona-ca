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

	public toObject() {
		return {
			id: this.id,
			email: this.email,
			emailVerified: this.emailVerified,
			name: this.name,
			iconUrl: this.iconUrl,
			gender: this.gender,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
