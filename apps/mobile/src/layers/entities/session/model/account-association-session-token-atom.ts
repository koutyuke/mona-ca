import { atom } from "jotai";
import { atomWithSecureStorage, secureStorageKeys } from "../../../shared/lib/storage";

export const accountAssociationSessionTokenAtom = atomWithSecureStorage<string | null>(
	secureStorageKeys.accountAssociationToken,
	null,
);

export const hasAccountAssociationSessionTokenAtom = atom(get => get(accountAssociationSessionTokenAtom) !== null);
