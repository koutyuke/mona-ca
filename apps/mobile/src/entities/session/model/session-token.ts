import { atom } from "jotai";
import { atomWithSecureStorage, secureStorageKeys } from "../../../shared/lib";

export const sessionTokenAtom = atomWithSecureStorage<string | null>(secureStorageKeys.sessionToken, null);

export const isAuthenticatedAtom = atom(get => get(sessionTokenAtom) !== null);
