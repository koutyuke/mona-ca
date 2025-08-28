import { atomWithSecureStorage, secureStorageKeys } from "../../../shared/lib";

export const accountAssociationSessionTokenAtom = atomWithSecureStorage<string | null>(
	secureStorageKeys.accountAssociationToken,
	null,
);
