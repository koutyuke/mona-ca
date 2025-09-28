import type { ComponentProps } from "react";
import { LastLoginMethodUI } from "./last-login-method.ui";

export const __DEV_LastLoginMethod = {
	components: {
		UI: LastLoginMethodUI,
	},
	props: {
		withMethod: (): ComponentProps<typeof LastLoginMethodUI> => ({
			method: "google",
		}),
		empty: (): ComponentProps<typeof LastLoginMethodUI> => ({
			method: null,
		}),
	},
};
