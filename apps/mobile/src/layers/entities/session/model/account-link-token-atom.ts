import { atom } from "jotai";
import { atomWithSecureStorage, secureStorageKeys } from "../../../shared/lib/storage";

export const accountLinkTokenAtom = atomWithSecureStorage<string | null>(secureStorageKeys.accountLinkToken, null);

export const hasAccountLinkTokenAtom = atom(get => get(accountLinkTokenAtom) !== null);
