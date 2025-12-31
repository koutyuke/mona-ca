import { LoginWithEmailUI } from "./login-with-email.ui";

import type { ComponentProps } from "react";

const noop = () => {};

export const __DEV_LoginWithEmail = {
	components: {
		UI: LoginWithEmailUI,
	},
	props: {
		default: (): ComponentProps<typeof LoginWithEmailUI> => ({
			loading: false,
			error: null,
			actions: {
				onSubmit: noop,
			},
			slots: {
				Turnstile: null,
			},
		}),
		loading: (): ComponentProps<typeof LoginWithEmailUI> => ({
			loading: true,
			error: null,
			actions: {
				onSubmit: noop,
			},
			slots: {
				Turnstile: null,
			},
		}),
		error: (): ComponentProps<typeof LoginWithEmailUI> => ({
			loading: false,
			error: "メールアドレスまたはパスワードが間違っています。",
			actions: {
				onSubmit: noop,
			},
			slots: {
				Turnstile: null,
			},
		}),
	},
};
