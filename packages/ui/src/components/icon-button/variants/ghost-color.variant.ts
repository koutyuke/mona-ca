import { tv, twPseudo } from "@mona-ca/tailwind-helpers";
import type { SlotContract, SupportColor } from "../type";

export const ghostColorVariants = tv({
	slots: {
		body: "bg-transparent",
		spinner: "",
		icon: "",
	} satisfies Required<SlotContract>,
	variants: {
		color: {
			red: {
				spinner: "fill-red-9",
				icon: twPseudo("color-red-9", {
					"group-active": "color-red-10",
				}),
			},
			blue: {
				spinner: "fill-blue-9",
				icon: twPseudo("color-blue-9", {
					"group-active": "color-blue-10",
				}),
			},
			green: {
				spinner: "fill-green-9",
				icon: twPseudo("color-green-9", {
					"group-active": "color-green-10",
				}),
			},
			yellow: {
				spinner: "fill-yellow-11",
				icon: twPseudo("color-yellow-11", {
					"group-active": "color-yellow-12",
				}),
			},
			salmon: {
				spinner: "fill-salmon-9",
				icon: twPseudo("color-salmon-9", {
					"group-active": "color-salmon-10",
				}),
			},
			gray: {
				spinner: "fill-gray-9",
				icon: twPseudo("color-gray-9", {
					"group-active": "color-gray-10",
				}),
			},
			white: {
				body: twPseudo("bg-white/0", {
					active: "bg-white-5",
				}),
				spinner: "fill-white",
				icon: "color-white",
			},
		} satisfies Record<SupportColor, SlotContract>,
		disabled: {
			true: {
				body: twPseudo("bg-transparent", {
					active: "bg-transparent",
				}),
				icon: "color-slate-11",
			} satisfies SlotContract,
		},
	},
});
