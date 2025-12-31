import { AuthWithSocialUI } from "./auth-with-social.ui";

import type { ComponentProps } from "react";

const noop = () => {};

export const __DEV_AuthWithSocial = {
	components: {
		UI: AuthWithSocialUI,
	},
	props: {
		default: (): ComponentProps<typeof AuthWithSocialUI> => ({
			pendingProvider: null,
			error: null,
			actions: {
				onPressDiscord: noop,
				onPressGoogle: noop,
			},
		}),
		pendingGoogle: (): ComponentProps<typeof AuthWithSocialUI> => ({
			pendingProvider: "google",
			error: null,
			actions: {
				onPressDiscord: noop,
				onPressGoogle: noop,
			},
		}),
		error: (): ComponentProps<typeof AuthWithSocialUI> => ({
			pendingProvider: null,
			error: "エラーが発生しました",
			actions: {
				onPressDiscord: noop,
				onPressGoogle: noop,
			},
		}),
	},
};
