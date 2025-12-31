import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "jotai";
import { RESET } from "jotai/utils";
import { useEffect } from "react";
import { accountLinkTokenAtom, sessionTokenAtom } from "../../entities/session";
import { themeAtom } from "../../entities/theme";
import { userAtom } from "../../entities/user";
import { subscribeToAuthReset } from "../../shared/lib/auth";
import { useResetJotaiStore } from "./resettable-jotai-provider";

import type { WritableAtom } from "jotai";
import type { FC, ReactNode } from "react";
import type { globalStorageKeys, secureStorageKeys } from "../../shared/lib/storage";

// biome-ignore lint/suspicious/noExplicitAny: Required for flexible atom typing with RESET action
type ResettableAtom = WritableAtom<any, [typeof RESET], void>;

const secureStorageAtom: Record<keyof typeof secureStorageKeys, ResettableAtom> = {
	sessionToken: sessionTokenAtom,
	accountLinkToken: accountLinkTokenAtom,
} as const;

type ExcludeResettableAtom = "lastLoginMethod";

const globalStorageAtom: Record<Exclude<keyof typeof globalStorageKeys, ExcludeResettableAtom>, ResettableAtom> = {
	theme: themeAtom,
	user: userAtom,
} as const;

const resettableAtoms = [...Object.values(secureStorageAtom), ...Object.values(globalStorageAtom)] as const;

export const AuthResetProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const currentStore = useStore();
	const resetJotaiStore = useResetJotaiStore();
	const qc = useQueryClient();

	// TODO: Add Dialog Notification

	useEffect(() => {
		const unsubscribe = subscribeToAuthReset(() => {
			// reset tanstack react-query cache
			qc.clear();

			// reset jotai atoms
			for (const atom of Object.values(resettableAtoms)) {
				currentStore.set(atom, RESET);
			}

			// reset jotai store
			resetJotaiStore();
		});

		return unsubscribe;
	}, [qc, resetJotaiStore, currentStore]);

	return children;
};
