export type User = {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: "man" | "woman";
	createdAt: Date;
	updatedAt: Date;
};

export type UserDto = {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: "man" | "woman";
	createdAt: string;
	updatedAt: string;
};

export type UpdateUserDto = {
	name?: string;
	iconUrl?: string;
	gender?: "man" | "woman";
};
