import { tv } from "@mona-ca/tailwind-helpers";
import type { SlotContract, SupportSize, SupportVariant } from "../type";

export const styleVariants = tv({
	slots: {
		body: "group relative flex max-w-full flex-row items-center justify-center gap-1 self-start transition-colors",
		spinner: "absolute",
		icon: "self-auto",
	} satisfies SlotContract,
	variants: {
		variant: {
			outline: {
				body: "border-[1.5px]",
			},
			light: {
				body: "border-none",
			},
			filled: {
				body: "border-none",
			},
			ghost: {
				body: "border-none",
			},
		} satisfies Record<SupportVariant, SlotContract>,
		size: {
			sm: {
				body: "size-9 rounded-lg",
				spinner: "size-4",
				icon: "size-4",
			},
			md: {
				body: "size-[3.125rem] rounded-xl",
				spinner: "size-5",
				icon: "size-5",
			},
			lg: {
				body: "size-24 rounded-2xl",
				spinner: "size-6",
				icon: "size-6",
			},
		} satisfies Record<SupportSize, SlotContract>,
		elevated: {
			true: {
				body: "shadow",
			} satisfies SlotContract,
			false: {
				body: "shadow-none",
			} satisfies SlotContract,
		},
		loading: {
			true: {
				icon: "opacity-0",
			} satisfies SlotContract,
		},
		disabled: {
			true: {
				body: "cursor-not-allowed opacity-75",
			} satisfies SlotContract,
			false: {
				body: "opacity-100",
			} satisfies SlotContract,
		},
		fullWidth: {
			true: {
				body: "w-full",
			} satisfies SlotContract,
		},
		bold: {
			true: {
				icon: "stroke-[2.5]",
			} satisfies SlotContract,
		},
		circle: {
			true: {
				body: "rounded-full",
			} satisfies SlotContract,
		},
	},
});
