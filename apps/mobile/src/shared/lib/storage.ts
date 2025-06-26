import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createJSONStorage } from "jotai/utils";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const storeStorage = createJSONStorage<any>(() => AsyncStorage);

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const secureStoreStorage = createJSONStorage<any>(() => ({
	getItem: SecureStore.getItemAsync,
	setItem: SecureStore.setItemAsync,
	removeItem: SecureStore.deleteItemAsync,
}));

export const storageKeys = {
	theme: "THEME",
	lastLoginMethod: "LAST_LOGIN_METHOD",
	sessionToken: "SESSION_TOKEN",
	user: "USER",
} as const;
