import { tv } from "@mona-ca/tailwind-helpers";
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
				text: "text-red-9 group-active:text-red-10",
				spinner: "fill-red-9",
				icon: "color-red-9 group-active:color-red-10",
			},
			blue: {
				text: "text-blue-9 group-active:text-blue-10",
				spinner: "fill-blue-9",
				icon: "color-blue-9 group-active:color-blue-10",
			},
			green: {
				text: "text-green-9 group-active:text-green-10",
				spinner: "fill-green-9",
				icon: "color-green-9 group-active:color-green-10",
			},
			yellow: {
				text: "text-yellow-11 group-active:text-yellow-12",
				spinner: "fill-yellow-11",
				icon: "color-yellow-11 group-active:color-yellow-12",
			},
			salmon: {
				text: "text-salmon-9 group-active:text-salmon-10",
				spinner: "fill-salmon-9",
				icon: "color-salmon-9 group-active:color-salmon-10",
			},
			gray: {
				text: "text-gray-9 group-active:text-gray-10",
				spinner: "fill-gray-9",
				icon: "color-gray-9 group-active:color-gray-10",
			},
			white: {
				body: "active:bg-white-5",
				text: "text-white",
				spinner: "fill-white",
				icon: "color-white",
			},
		} satisfies Record<SupportColor, SlotContract>,
		disabled: {
			true: {
				body: "bg-transparent active:bg-transparent",
				text: "text-slate-11",
				icon: "color-slate-11",
			} satisfies SlotContract,
		},
	},
});
