import { atom } from "jotai";
import { RESET } from "jotai/utils";
import { hasSessionTokenAtom } from "../../../session";
import type { UpdateUserDto, User } from "../user";
import { syncUserToStorageEffectAtom } from "./effect-atom";
import { queryAtom } from "./query-atom";
import { lastUpdatedAtAtom, userOfflineOutboxAtom, userPersistedAtom } from "./storage-atom";

// type UserError = {
// 	code: QueryFnError["code"];
// 	errorMessage: string;
// };

type UserAtom = {
	data: User | null;
	loading: boolean;
	backgroundLoading: boolean;
};

type AtomAction =
	| {
			type: "update";
			payload: User;
	  }
	| {
			type: "set-outbox";
			payload: UpdateUserDto;
	  }
	| {
			type: "clear-outbox";
	  };

export const userAtom = atom(
	(get): UserAtom => {
		get(syncUserToStorageEffectAtom);

		const hasSessionToken = get(hasSessionTokenAtom);
		const q = get(queryAtom);
		const persisted = get(userPersistedAtom);
		const outbox = get(userOfflineOutboxAtom);

		if (!hasSessionToken) {
			return {
				data: null,
				loading: false,
				backgroundLoading: false,
			};
		}

		// TODO: errorはここではなく、toastで通知する
		// let _error: UserError | null = null;

		// if (q.error instanceof FetchError) {
		// 	_error = { code: q.error.code, errorMessage: q.error.errorMessage };
		// } else if (q.error instanceof Error) {
		// 	_error = { code: "UNKNOWN_ERROR", errorMessage: "unknown error" };
		// }

		const data = persisted
			? {
					...persisted,
					...outbox?.payload,
				}
			: (q.data ?? null);

		const loading = !data && q.isFetching;
		const backgroundLoading = !!data && q.isFetching;

		return {
			data,
			loading,
			backgroundLoading,
		};
	},
	(_get, set, action: AtomAction | typeof RESET) => {
		if (action === RESET) {
			set(userPersistedAtom, null);
			set(lastUpdatedAtAtom, 0);
			return;
		}

		if (action.type === "update") {
			set(userPersistedAtom, action.payload);
			set(lastUpdatedAtAtom, Date.now());
			return;
		}

		if (action.type === "set-outbox") {
			set(userOfflineOutboxAtom, { payload: action.payload, updatedAt: Date.now() });
			return;
		}

		if (action.type === "clear-outbox") {
			set(userOfflineOutboxAtom, null);
			return;
		}
	},
);
