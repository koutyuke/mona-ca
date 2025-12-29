import { useAtomValue } from "jotai";
import { lastLoginMethodAtom } from "./last-login-method-atom";

export const useLastLoginMethod = () => useAtomValue(lastLoginMethodAtom);
