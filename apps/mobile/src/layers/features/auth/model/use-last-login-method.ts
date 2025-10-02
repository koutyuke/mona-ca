import { useAtomValue } from "jotai";
import { lastLoginMethodAtom } from "./last-login-method-atom";

export const useLastLoginMethod = () => {
	const lastLoginMethod = useAtomValue(lastLoginMethodAtom);
	return lastLoginMethod;
};
