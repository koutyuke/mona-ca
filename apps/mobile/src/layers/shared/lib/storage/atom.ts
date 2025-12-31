import { atomFamily, atomWithStorage } from "jotai/utils";
import { createGlobalJSONStorage, createSecureJSONStorage, createUserJSONStorage } from "./json-storage";

import type { ValueOf } from "../data/types";
import type { globalStorageKeys, secureStorageKeys, userStorageKeys } from "./keys";
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
