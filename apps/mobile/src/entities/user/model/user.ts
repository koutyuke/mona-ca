import { atomWithStorage } from "jotai/utils";
import { storageKeys, storeStorage } from "../../../shared/lib";

export interface User {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: "man" | "woman";
	createdAt: Date;
	updatedAt: Date;
}

export interface UserDto {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	iconUrl: string | null;
	gender: "man" | "woman";
	createdAt: string;
	updatedAt: string;
}

export const userAtom = atomWithStorage<User | null>(storageKeys.user, null, storeStorage);
