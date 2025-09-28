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
			actions: {
				onPressDiscord: noop,
				onPressGoogle: noop,
			},
		}),
		pendingGoogle: (): ComponentProps<typeof LoginWithSocialUI> => ({
			pendingProvider: "google",
			actions: {
				onPressDiscord: noop,
				onPressGoogle: noop,
			},
		}),
	},
};
