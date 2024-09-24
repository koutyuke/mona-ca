import type { DatabaseSession, DatabaseUser, Lucia } from "lucia";

export interface DatabaseUserAttributes {
	readonly email: string;
	readonly emailVerified: boolean;
	readonly name: string;
	readonly iconUrl: string | null;
	readonly gender: "man" | "woman";
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export interface DatabaseSessionAttributes extends Record<never, never> {}

export type LuciaWithDatabaseTypes = Lucia<DatabaseSessionAttributes, DatabaseUserAttributes>;

export type FlatDatabaseUser = Omit<DatabaseUser, "attributes"> & DatabaseUserAttributes;

export type FlatDatabaseSession = Omit<DatabaseSession, "attributes"> & DatabaseSessionAttributes;

declare module "lucia" {
	interface Register {
		Lucia: LuciaWithDatabaseTypes;
		DatabaseUserAttributes: DatabaseUserAttributes;
		DatabaseSessionAttributes: DatabaseSessionAttributes;
	}
}
