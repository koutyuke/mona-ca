import { atomWithSecureStorage, secureStorageKeys } from "../../../shared/lib/storage";

export const accountAssociationSessionTokenAtom = atomWithSecureStorage<string | null>(
	secureStorageKeys.accountAssociationToken,
	null,
);
