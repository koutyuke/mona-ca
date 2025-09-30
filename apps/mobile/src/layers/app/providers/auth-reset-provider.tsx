import { useQueryClient } from "@tanstack/react-query";
import { type WritableAtom, useStore } from "jotai";
import { RESET } from "jotai/utils";
import { type FC, type ReactNode, useEffect } from "react";
import { accountAssociationSessionTokenAtom, sessionTokenAtom } from "../../entities/session";
import { themeAtom } from "../../entities/theme";
import { userAtom } from "../../entities/user";
import { subscribeToAuthReset } from "../../shared/lib/auth";
import type { globalStorageKeys, secureStorageKeys } from "../../shared/lib/storage";
import { useResetJotaiStore } from "./resettable-jotai-provider";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type ResettableAtom = WritableAtom<any, [typeof RESET], void>;

const secureStorageAtom: Record<keyof typeof secureStorageKeys, ResettableAtom> = {
	sessionToken: sessionTokenAtom,
	accountAssociationToken: accountAssociationSessionTokenAtom,
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
