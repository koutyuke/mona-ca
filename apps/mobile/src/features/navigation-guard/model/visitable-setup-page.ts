import { atomWithGlobalStorage, globalStorageKeys } from "../../../shared/lib";

export const visitableSetupPageAtom = atomWithGlobalStorage<"ready" | "personalize" | false>(
	globalStorageKeys.visitableSetupPage,
	false,
);
