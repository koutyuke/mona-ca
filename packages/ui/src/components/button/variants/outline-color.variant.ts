import { tv, twPseudo } from "@mona-ca/tailwind-helpers";
import type { SlotContract, SupportColor } from "../type";

export const outlineColorVariants = tv({
	slots: {
		body: "",
		text: "",
		spinner: "",
		icon: "",
	} satisfies Required<SlotContract>,
	variants: {
		color: {
			red: {
				body: twPseudo("border-red-7 bg-red-2", {
					active: "bg-red-3",
				}),
				text: "text-red-11",
				spinner: "fill-red-11",
				icon: "color-red-11",
			},
			blue: {
				body: twPseudo("border-blue-7 bg-blue-2", {
					active: "bg-blue-3",
				}),
				text: "text-blue-11",
				spinner: "fill-blue-11",
				icon: "color-blue-11",
			},
			green: {
				body: twPseudo("border-green-7 bg-green-2", {
					active: "bg-green-3",
				}),
				text: "text-green-11",
				spinner: "fill-green-11",
				icon: "color-green-11",
			},
			yellow: {
				body: twPseudo("border-yellow-7 bg-yellow-2", {
					active: "bg-yellow-3",
				}),
				text: "text-yellow-11",
				spinner: "fill-yellow-11",
				icon: "color-yellow-11",
			},
			salmon: {
				body: twPseudo("border-salmon-7 bg-salmon-2", {
					active: "bg-salmon-3",
				}),
				text: "text-salmon-11",
				spinner: "fill-salmon-11",
				icon: "color-salmon-11",
			},
			gray: {
				body: twPseudo("border-slate-7 bg-slate-2", {
					active: "bg-slate-3",
				}),
				text: "text-slate-11",
				spinner: "fill-slate-11",
				icon: "color-slate-11",
			},
			white: {
				body: twPseudo("border-white bg-white/0", {
					active: "bg-white-4",
				}),
				text: "text-white",
				spinner: "fill-white",
				icon: "color-white",
			},
		} satisfies Record<SupportColor, SlotContract>,
		disabled: {
			true: {
				body: twPseudo("border-slate-7 bg-slate-3", {
					active: "border-slate-7 bg-slate-3",
				}),
				text: "text-slate-11",
				icon: "color-slate-11",
			} satisfies SlotContract,
		},
	},
});
