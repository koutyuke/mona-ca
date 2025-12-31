import { TurnstileFormUI } from "./turnstile-form.ui";
import { TurnstileModalUI } from "./turnstile-modal.ui";

import type { ComponentProps } from "react";

const noop = () => {};

export const __DEV_TurnstileModal = {
	components: {
		UI: TurnstileModalUI,
	},
	props: {
		visible: (): ComponentProps<typeof TurnstileModalUI> => ({
			isVisible: true,
			isClosable: true,
			actions: {
				onClose: noop,
			},
			slots: {
				TurnstileForm: null,
			},
		}),
		hidden: (): ComponentProps<typeof TurnstileModalUI> => ({
			isVisible: false,
			isClosable: true,
			actions: {
				onClose: noop,
			},
			slots: {
				TurnstileForm: null,
			},
		}),
	},
};

export const __DEV_TurnstileForm = {
	components: {
		UI: TurnstileFormUI,
	},
	props: {
		default: (): ComponentProps<typeof TurnstileFormUI> => ({
			sitekey: "1x00000000000000000000AA", // This is a valid sitekey for testing
			onVerify: noop,
		}),
	},
};
