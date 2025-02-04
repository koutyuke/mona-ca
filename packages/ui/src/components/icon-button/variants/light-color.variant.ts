import { tv } from "@mona-ca/tailwind-helpers";
import type { SlotContract, SupportColor } from "../type";

export const lightColorVariants = tv({
	slots: {
		body: "",
		spinner: "",
		icon: "",
	} satisfies Required<SlotContract>,
	variants: {
		color: {
			red: {
				body: "bg-red-4 active:bg-red-5",
				spinner: "fill-red-11",
				icon: "color-red-11",
			},
			blue: {
				body: "bg-blue-4 active:bg-blue-5",
				spinner: "fill-blue-11",
				icon: "color-blue-11",
			},
			green: {
				body: "bg-green-4 active:bg-green-5",
				spinner: "fill-green-11",
				icon: "color-green-11",
			},
			yellow: {
				body: "bg-yellow-4 active:bg-yellow-5",
				spinner: "fill-yellow-11",
				icon: "color-yellow-11",
			},
			salmon: {
				body: "bg-salmon-4 active:bg-salmon-5",
				spinner: "fill-salmon-11",
				icon: "color-salmon-11",
			},
			gray: {
				body: "bg-slate-4 active:bg-slate-5",
				spinner: "fill-slate-11",
				icon: "color-slate-11",
			},
			white: {
				body: "bg-white-4 active:bg-white-7",
				spinner: "fill-white",
				icon: "color-white",
			},
		} satisfies Record<SupportColor, SlotContract>,
		disabled: {
			true: {
				body: "bg-slate-4 active:bg-slate-4",
				icon: "color-slate-11",
			} satisfies SlotContract,
		},
	},
});
