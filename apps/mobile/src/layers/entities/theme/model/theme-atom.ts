import { atomWithGlobalStorage, globalStorageKeys } from "../../../shared/lib/storage";

export type Theme = "light" | "dark" | "system";

export const themeAtom = atomWithGlobalStorage<Theme>(globalStorageKeys.theme, "light");
