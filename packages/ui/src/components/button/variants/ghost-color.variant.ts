import { tv, twPseudo } from "@mona-ca/tailwind-helpers";
import type { SlotContract, SupportColor } from "../type";

export const ghostColorVariants = tv({
	slots: {
		body: "bg-transparent",
		text: "",
		spinner: "",
		icon: "",
	} satisfies Required<SlotContract>,
	variants: {
		color: {
			red: {
				text: twPseudo("text-red-9", {
					"group-active": "text-red-10",
				}),
				spinner: "fill-red-9",
				icon: twPseudo("color-red-9", {
					"group-active": "color-red-10",
				}),
			},
			blue: {
				text: twPseudo("text-blue-9", {
					"group-active": "text-blue-10",
				}),
				spinner: "fill-blue-9",
				icon: twPseudo("color-blue-9", {
					"group-active": "color-blue-10",
				}),
			},
			green: {
				text: twPseudo("text-green-9", {
					"group-active": "text-green-10",
				}),
				spinner: "fill-green-9",
				icon: twPseudo("color-green-9", {
					"group-active": "color-green-10",
				}),
			},
			yellow: {
				text: twPseudo("text-yellow-11", {
					"group-active": "text-yellow-12",
				}),
				spinner: "fill-yellow-11",
				icon: twPseudo("color-yellow-11", {
					"group-active": "color-yellow-12",
				}),
			},
			salmon: {
				text: twPseudo("text-salmon-9", {
					"group-active": "text-salmon-10",
				}),
				spinner: "fill-salmon-9",
				icon: twPseudo("color-salmon-9", {
					"group-active": "color-salmon-10",
				}),
			},
			gray: {
				text: twPseudo("text-gray-9", {
					"group-active": "text-gray-10",
				}),
				spinner: "fill-gray-9",
				icon: twPseudo("color-gray-9", {
					"group-active": "color-gray-10",
				}),
			},
			white: {
				body: twPseudo("", {
					active: "bg-white-5",
				}),
				text: "text-white",
				spinner: "fill-white",
				icon: "color-white",
			},
		} satisfies Record<SupportColor, SlotContract>,
		disabled: {
			true: {
				body: twPseudo("bg-transparent", {
					active: "bg-transparent",
				}),
				text: "text-slate-11",
				icon: "color-slate-11",
			} satisfies SlotContract,
		},
	},
});
