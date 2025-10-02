import { atom } from "jotai";
import type { atomWithStorage } from "jotai/utils";
import type { ValueOf } from "../../../../shared/lib/data";
import {
	type JSONStringifyable,
	atomFamilyWithUserStorage,
	atomWithGlobalStorage,
	globalStorageKeys,
	userStorageKeys,
} from "../../../../shared/lib/storage";
import type { UpdateUserDto, User } from "../user";

export const lastUpdatedAtAtom = atom<number>(0);

export const userPersistedAtom = atomWithGlobalStorage<User | null>(globalStorageKeys.user, null);

type UserStorageAtom<T extends JSONStringifyable> = ReturnType<typeof atomWithStorage<T>>;

export const atomWithUserStorage = <T extends JSONStringifyable>(
	storageKey: ValueOf<typeof userStorageKeys>,
	defaultValue: T,
): UserStorageAtom<T> => {
	const family = atomFamilyWithUserStorage<T>(storageKey, defaultValue);
	return atom(
		(get): T => {
			const user = get(userPersistedAtom);
			if (!user) {
				return defaultValue;
			}
			return get(family(user.id));
		},
		(get, set, update) => {
			const user = get(userPersistedAtom);
			if (!user) {
				return;
			}
			const target = family(user.id);
			if (typeof update === "function") {
				const prev = get(target);
				set(target, (update as (prev: T) => T)(prev));
			} else {
				set(target, update);
			}
		},
	);
};

type UserUpdateQuery = {
	payload: UpdateUserDto;
	updatedAt: number;
} | null;

// TODO: ローカルのデータをサーバーに送信する処理の実装
export const userOfflineOutboxAtom = atomWithUserStorage<UserUpdateQuery>(userStorageKeys.userOfflineOutbox, null);
