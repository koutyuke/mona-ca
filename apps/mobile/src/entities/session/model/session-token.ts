import { atomWithStorage } from "jotai/utils";
import { secureStoreStorage, storageKeys } from "../../../shared/lib";

export const sessionTokenAtom = atomWithStorage<string | null>(storageKeys.sessionToken, null, secureStoreStorage);
