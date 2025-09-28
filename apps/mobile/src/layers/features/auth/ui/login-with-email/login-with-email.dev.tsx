import type { ComponentProps } from "react";
import { LoginWithEmailUI } from "./login-with-email.ui";

const noop = () => {};

export const __DEV_LoginWithEmail = {
	components: {
		UI: LoginWithEmailUI,
	},
	props: {
		default: (): ComponentProps<typeof LoginWithEmailUI> => ({
			loading: false,
			actions: {
				onSubmit: noop,
			},
			slots: {
				Turnstile: null,
			},
		}),
		loading: (): ComponentProps<typeof LoginWithEmailUI> => ({
			loading: true,
			actions: {
				onSubmit: noop,
			},
			slots: {
				Turnstile: null,
			},
		}),
	},
};
