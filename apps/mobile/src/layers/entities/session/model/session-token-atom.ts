import { atom } from "jotai";
import { atomWithSecureStorage, secureStorageKeys } from "../../../shared/lib/storage";

export const sessionTokenAtom = atomWithSecureStorage<string | null>(secureStorageKeys.sessionToken, null);

export const hasSessionTokenAtom = atom(get => get(sessionTokenAtom) !== null);
