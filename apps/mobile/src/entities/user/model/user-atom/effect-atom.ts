import { atomEffect } from "jotai-effect";
import { isAuthenticatedAtom } from "../../../session";
import { queryAtom } from "./query-atom";
import { lastUpdatedAtAtom, userOfflineOutboxAtom, userPersistedAtom } from "./storage-atom";

export const syncUserToStorageEffectAtom = atomEffect((get, set) => {
	const isAuthenticated = get(isAuthenticatedAtom);
	const q = get(queryAtom);
	const lastSyncedDataUpdatedAt = get(lastUpdatedAtAtom);

	if (!isAuthenticated) {
		set(userPersistedAtom, null);
		set(lastUpdatedAtAtom, 0);
		return;
	}

	if (q.isSuccess && q.data) {
		if (!q.isPlaceholderData && q.dataUpdatedAt > lastSyncedDataUpdatedAt) {
			set(userPersistedAtom, q.data);
			set(lastUpdatedAtAtom, q.dataUpdatedAt);
			set(userOfflineOutboxAtom, null);
		}
		return;
	}

	// TODO: エラー処理toastで通知する
});
