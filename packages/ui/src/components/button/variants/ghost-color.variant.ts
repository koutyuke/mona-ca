import { tv, twPseudo } from "@mona-ca/tailwind-helpers";
import type { SlotContract, SupportColor } from "../type";

export const ghostColorVariants = tv({
	slots: {
		body: "",
		text: "",
		spinner: "",
		icon: "",
	} satisfies Required<SlotContract>,
	variants: {
		color: {
			red: {
				body: "bg-red-3/0",
				text: twPseudo("text-red-9", {
					"group-active": "text-red-11",
				}),
				spinner: "fill-red-9",
				icon: twPseudo("color-red-9", {
					"group-active": "color-red-11",
				}),
			},
			blue: {
				body: "bg-blue-3/0",
				text: twPseudo("text-blue-9", {
					"group-active": "text-blue-11",
				}),
				spinner: "fill-blue-9",
				icon: twPseudo("color-blue-9", {
					"group-active": "color-blue-11",
				}),
			},
			green: {
				body: "bg-green-3/0",
				text: twPseudo("text-green-9", {
					"group-active": "text-green-11",
				}),
				spinner: "fill-green-9",
				icon: twPseudo("color-green-9", {
					"group-active": "color-green-11",
				}),
			},
			yellow: {
				body: "bg-yellow-3/0",
				text: twPseudo("text-yellow-11", {
					"group-active": "text-yellow-12",
				}),
				spinner: "fill-yellow-11",
				icon: twPseudo("color-yellow-11", {
					"group-active": "color-yellow-12",
				}),
			},
			salmon: {
				body: "bg-salmon-3/0",
				text: twPseudo("text-salmon-9", {
					"group-active": "text-salmon-11",
				}),
				spinner: "fill-salmon-9",
				icon: twPseudo("color-salmon-9", {
					"group-active": "color-salmon-11",
				}),
			},
			gray: {
				body: "bg-gray-3/0",
				text: twPseudo("text-gray-9", {
					"group-active": "text-gray-11",
				}),
				spinner: "fill-gray-9",
				icon: twPseudo("color-gray-9", {
					"group-active": "color-gray-11",
				}),
			},
			white: {
				body: twPseudo("bg-white/0", {
					active: "bg-white-5",
				}),
				text: "text-white",
				spinner: "fill-white",
				icon: "color-white",
			},
		} satisfies Record<SupportColor, SlotContract>,
		loading: {
			true: {
				body: "",
				text: "",
			} satisfies SlotContract,
		},
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
