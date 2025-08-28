import { atomWithGlobalStorage, globalStorageKeys } from "../../../shared/lib";

export type LoginMethod = "email" | "google" | "discord";

export const lastLoginMethodAtom = atomWithGlobalStorage<LoginMethod | null>(globalStorageKeys.lastLoginMethod, null);
