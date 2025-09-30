import type { ComponentProps } from "react";
import { LoginWithSocialUI } from "./login-with-social.ui";

const noop = () => {};

export const __DEV_LoginWithSocial = {
	components: {
		UI: LoginWithSocialUI,
	},
	props: {
		default: (): ComponentProps<typeof LoginWithSocialUI> => ({
			pendingProvider: null,
			error: null,
			actions: {
				onPressDiscord: noop,
				onPressGoogle: noop,
			},
		}),
		pendingGoogle: (): ComponentProps<typeof LoginWithSocialUI> => ({
			pendingProvider: "google",
			error: null,
			actions: {
				onPressDiscord: noop,
				onPressGoogle: noop,
			},
		}),
		error: (): ComponentProps<typeof LoginWithSocialUI> => ({
			pendingProvider: null,
			error: "エラーが発生しました",
			actions: {
				onPressDiscord: noop,
				onPressGoogle: noop,
			},
		}),
	},
};
