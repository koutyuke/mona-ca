import { atomWithGlobalStorage, globalStorageKeys } from "../../../shared/lib/storage";

export type LoginMethod = "email" | "google" | "discord";

export const lastLoginMethodAtom = atomWithGlobalStorage<LoginMethod | null>(globalStorageKeys.lastLoginMethod, null);
