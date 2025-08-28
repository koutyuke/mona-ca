import { atomFamily, atomWithStorage } from "jotai/utils";
import type { ValueOf } from "../types";
import { createGlobalJSONStorage, createSecureJSONStorage, createUserJSONStorage } from "./json-storage";
import type { globalStorageKeys } from "./keys";
import type { secureStorageKeys, userStorageKeys } from "./keys";
import type { JSONStringifyable } from "./types";

export const atomWithGlobalStorage = <T extends JSONStringifyable>(
	key: ValueOf<typeof globalStorageKeys>,
	defaultValue: T,
) => {
	return atomWithStorage(key, defaultValue, createGlobalJSONStorage(), { getOnInit: true });
};

export const atomWithSecureStorage = <T extends JSONStringifyable>(
	key: ValueOf<typeof secureStorageKeys>,
	defaultValue: T,
) => {
	return atomWithStorage(key, defaultValue, createSecureJSONStorage(), { getOnInit: true });
};

export const atomFamilyWithUserStorage = <T extends JSONStringifyable>(
	key: ValueOf<typeof userStorageKeys>,
	defaultValue: T,
) => {
	return atomFamily((uid: string) =>
		atomWithStorage(key, defaultValue, createUserJSONStorage(uid), { getOnInit: true }),
	);
};
