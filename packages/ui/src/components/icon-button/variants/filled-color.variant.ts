import { tv, twPseudo } from "@mona-ca/tailwind-helpers";
import type { SlotContract, SupportColor } from "../type";

export const filledColorVariants = tv({
	slots: {
		body: "",
		spinner: "",
		icon: "",
	} satisfies Required<SlotContract>,
	variants: {
		color: {
			red: {
				body: twPseudo("bg-red-9", {
					active: "bg-red-10",
				}),
				spinner: "fill-white",
				icon: "color-white",
			},
			blue: {
				body: twPseudo("bg-blue-9", {
					active: "bg-blue-10",
				}),
				spinner: "fill-white",
				icon: "color-white",
			},
			green: {
				body: twPseudo("bg-green-9", {
					active: "bg-green-10",
				}),
				spinner: "fill-white",
				icon: "color-white",
			},
			yellow: {
				body: twPseudo("bg-yellow-9", {
					active: "bg-yellow-10",
				}),
				spinner: "fill-black",
				icon: "color-black",
			},
			salmon: {
				body: twPseudo("bg-salmon-9", {
					active: "bg-salmon-10",
				}),
				spinner: "fill-white",
				icon: "color-white",
			},
			gray: {
				body: twPseudo("bg-slate-9", {
					active: "bg-slate-10",
				}),
				spinner: "fill-white",
				icon: "color-white",
			},
			white: {
				body: twPseudo("bg-white", {
					active: "bg-white-8",
				}),
				// nativewind can't use color-transparent.
				// so when this is used, you need to set text color to the same color as the background.
				spinner: "",
				icon: "",
			},
		} satisfies Record<SupportColor, SlotContract>,
		loading: {
			true: {
				body: "",
			} satisfies SlotContract,
		},
		disabled: {
			true: {
				body: twPseudo("bg-slate-9", {
					hover: "bg-slate-9",
					active: "bg-slate-9 brightness-100",
				}),
				icon: "color-slate-2",
			} satisfies SlotContract,
		},
	},
});
