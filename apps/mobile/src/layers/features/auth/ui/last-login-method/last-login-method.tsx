import { useLastLoginMethod } from "../../model/use-last-login-method";
import { LastLoginMethodUI } from "./last-login-method.ui";

export const LastLoginMethod = () => {
	const lastLoginMethod = useLastLoginMethod();

	return <LastLoginMethodUI method={lastLoginMethod} />;
};
