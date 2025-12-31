import { SignupWithEmailUI } from "./signup-with-email.ui";

import type { ComponentProps } from "react";

const noop = () => {};

export const __DEV_SignupWithEmail = {
	components: {
		UI: SignupWithEmailUI,
	},
	props: {
		default: (): ComponentProps<typeof SignupWithEmailUI> => ({
			loading: false,
			error: null,
			actions: {
				onSubmit: noop,
			},
			slots: {
				Turnstile: null,
			},
		}),
		loading: (): ComponentProps<typeof SignupWithEmailUI> => ({
			loading: true,
			error: null,
			actions: {
				onSubmit: noop,
			},
			slots: {
				Turnstile: null,
			},
		}),
		error: (): ComponentProps<typeof SignupWithEmailUI> => ({
			loading: false,
			error: "エラーが発生しました",
			actions: {
				onSubmit: noop,
			},
			slots: {
				Turnstile: null,
			},
		}),
	},
};
