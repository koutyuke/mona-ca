import { atomWithGlobalStorage, globalStorageKeys } from "../../../shared/lib/storage";

export const visitPersonalizePageFlagAtom = atomWithGlobalStorage<boolean>(
	globalStorageKeys.visitPersonalizePageFlag,
	false,
);
