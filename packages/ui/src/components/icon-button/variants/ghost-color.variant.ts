import { tv } from "@mona-ca/tailwind-helpers";
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
				icon: "color-red-9 group-active:color-red-10",
			},
			blue: {
				spinner: "fill-blue-9",
				icon: "color-blue-9 group-active:color-blue-10",
			},
			green: {
				spinner: "fill-green-9",
				icon: "color-green-9 group-active:color-green-10",
			},
			yellow: {
				spinner: "fill-yellow-11",
				icon: "color-yellow-11 group-active:color-yellow-12",
			},
			salmon: {
				spinner: "fill-salmon-9",
				icon: "color-salmon-9 group-active:color-salmon-10",
			},
			gray: {
				spinner: "fill-gray-9",
				icon: "color-gray-9 group-active:color-gray-10",
			},
			white: {
				body: "bg-white/0 active:bg-white-5",
				spinner: "fill-white",
				icon: "color-white",
			},
		} satisfies Record<SupportColor, SlotContract>,
		disabled: {
			true: {
				body: "bg-transparent active:bg-transparent",
				icon: "color-slate-11",
			} satisfies SlotContract,
		},
	},
});
