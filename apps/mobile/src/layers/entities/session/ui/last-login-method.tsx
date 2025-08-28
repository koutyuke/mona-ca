import { Text } from "@mona-ca/ui/native/components";
import { useAtom } from "jotai";
import { lastLoginMethodLabels } from "../lib/last-login-method-labels";
import { lastLoginMethodAtom } from "../model/last-login-method";

export const LastLoginMethod = () => {
	const [lastLoginMethod] = useAtom(lastLoginMethodAtom);

	if (!lastLoginMethod) {
		return null;
	}

	return (
		<Text size="xs" className="text-slate-11">
			前回のログイン方法: {lastLoginMethodLabels[lastLoginMethod]}
		</Text>
	);
};
