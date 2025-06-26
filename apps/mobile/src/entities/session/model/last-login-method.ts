import { atomWithStorage } from "jotai/utils";
import { storageKeys, storeStorage } from "../../../shared/lib";

export type LoginMethod = "email" | "google" | "discord";

export const lastLoginMethodAtom = atomWithStorage<LoginMethod | null>(storageKeys.lastLoginMethod, null, storeStorage);
