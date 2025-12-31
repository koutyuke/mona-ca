import * as Crypto from "expo-crypto";
import * as expoSecureStorage from "expo-secure-store";
import { createJSONStorage } from "jotai/utils";
import { MMKV } from "react-native-mmkv";
import { bytesToHex } from "../data/converter";

import type { JSONStringifyable } from "./types";

// === unencrypted storage ===

const GlobalStorage = new MMKV({ id: "global" });

const UserStorageMap = new Map<string, MMKV>();

const getUserStorage = (id: string) => {
	const existUserStorage = UserStorageMap.get(id);
	if (existUserStorage) {
		return existUserStorage;
	}
	const userStorage = new MMKV({ id: `user-${id}` });
	UserStorageMap.set(id, userStorage);
	return userStorage;
};

// === encrypted storage ===

let SecureStorage: MMKV | null = null;

const SECURE_STORAGE_KEY = "SECURE_STORAGE_KEY";

const getSecureMMKV = (): MMKV => {
	if (SecureStorage) {
		return SecureStorage;
	}

	let key = expoSecureStorage.getItem(SECURE_STORAGE_KEY);
	if (!key) {
		key = bytesToHex(Crypto.getRandomBytes(32));
		expoSecureStorage.setItem(SECURE_STORAGE_KEY, key);
	}
	SecureStorage = new MMKV({ id: "secure", encryptionKey: key });
	return SecureStorage;
};

// === storage factory ===

const createMMKVJSONStorage = <T extends JSONStringifyable>(mmkv: MMKV) => {
	return createJSONStorage<T>(() => {
		return {
			getItem: (key: string): string | null => {
				const value = mmkv.getString(key);
				return value ? value : null;
			},
			setItem: (key: string, value: string): void => {
				mmkv.set(key, value);
			},
			removeItem: (key: string): void => {
				mmkv.delete(key);
			},
			subscribe: (key: string, callback: (value: string | null) => void): (() => void) => {
				const listener = (changedKey: string) => {
					if (changedKey === key) {
						callback(mmkv.getString(key) ?? null);
					}
				};

				const { remove } = mmkv.addOnValueChangedListener(listener);

				return () => {
					remove();
				};
			},
		};
	});
};

export const createGlobalJSONStorage = <T extends JSONStringifyable>() => {
	return createMMKVJSONStorage<T>(GlobalStorage);
};

export const createUserJSONStorage = <T extends JSONStringifyable>(id: string) => {
	return createMMKVJSONStorage<T>(getUserStorage(id));
};

export const createSecureJSONStorage = <T extends JSONStringifyable>() => {
	return createJSONStorage<T>(() => {
		return {
			getItem: (key: string): string | null => {
				const mmkv = getSecureMMKV();
				return mmkv.getString(key) ?? null;
			},
			setItem: (key: string, value: string): void => {
				const mmkv = getSecureMMKV();
				mmkv.set(key, value);
			},
			removeItem: (key: string): void => {
				const mmkv = getSecureMMKV();
				mmkv.delete(key);
			},
		};
	});
};
