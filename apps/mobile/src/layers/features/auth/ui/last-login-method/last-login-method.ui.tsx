import { Text } from "@mona-ca/ui/native/components";
import { lastLoginMethodLabels } from "../../lib/last-login-method-labels";

import type { LoginMethod } from "../../model/last-login-method-atom";

type Props = {
	method: LoginMethod | null;
};

export const LastLoginMethodUI = ({ method }: Props) => {
	if (!method) {
		return null;
	}

	return (
		<Text className="text-slate-11" size="sm">
			前回のログイン方法: {lastLoginMethodLabels[method]}
		</Text>
	);
};
