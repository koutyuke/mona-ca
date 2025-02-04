import { tv } from "@mona-ca/tailwind-helpers";
import type { SlotContract, SupportColor } from "../type";

export const filledColorVariants = tv({
	slots: {
		body: "",
		text: "",
		spinner: "",
		icon: "",
	} satisfies Required<SlotContract>,
	variants: {
		color: {
			red: {
				body: "bg-red-9 active:bg-red-10",
				text: "text-white",
				spinner: "fill-white",
				icon: "color-white",
			},
			blue: {
				body: "bg-blue-9 active:bg-blue-10",
				text: "text-white",
				spinner: "fill-white",
				icon: "color-white",
			},
			green: {
				body: "bg-green-9 active:bg-green-10",
				text: "text-white",
				spinner: "fill-white",
				icon: "color-white",
			},
			yellow: {
				body: "bg-yellow-9 active:bg-yellow-10",
				text: "text-black",
				spinner: "fill-black",
				icon: "color-black",
			},
			salmon: {
				body: "bg-salmon-9 active:bg-salmon-10",
				text: "text-white",
				spinner: "fill-white",
				icon: "color-white",
			},
			gray: {
				body: "bg-slate-9 active:bg-slate-10",
				text: "text-white",
				spinner: "fill-white",
				icon: "color-white",
			},
			white: {
				body: "bg-white active:bg-white-10",
				// nativewind can't use color-transparent.
				// so when this is used, you need to set text color to the same color as the background.
				text: "",
				spinner: "",
				icon: "",
			},
		} satisfies Record<SupportColor, SlotContract>,
		disabled: {
			true: {
				body: "bg-slate-9 hover:bg-slate-9 active:bg-slate-9 active:brightness-100",
				text: "text-slate-2",
				icon: "color-slate-2",
			} satisfies SlotContract,
		},
	},
});
