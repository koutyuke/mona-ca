import { tv } from "@mona-ca/tailwind-helpers";

export const styleVariants = tv({
	slots: {
		body: "group relative flex max-w-full flex-row items-center justify-center gap-1 self-start transition",
		text: "self-auto",
		icon: "self-auto opacity-100",
	},
	variants: {
		variant: {
			outline: {
				body: "border",
			},
			light: {
				body: "border-none",
			},
			filled: {
				body: "border-none",
			},
		},
		size: {
			sm: {
				body: "h-[2.125rem] rounded-lg pr-3.5 pl-3.5",
			},
			md: {
				body: "h-[3.125rem] rounded-xl pr-4 pl-4",
			},
		},
		loading: {
			true: {
				text: "opacity-0",
				icon: "opacity-0",
			},
		},
		disabled: {
			true: {
				body: "opacity-75",
			},
		},
		circle: {
			true: {
				body: "rounded-full",
			},
		},
		rightIcon: {
			true: {
				body: "pr-3",
			},
		},
		leftIcon: {
			true: {
				body: "pl-3",
			},
		},
	},
});

export const outlineColorVariants = tv({
	slots: {
		body: "",
		text: "",
		icon: "",
	},
	variants: {
		color: {
			red: {
				body: "border-red-7 bg-red-2 active:bg-red-3",
				text: "text-red-11",
				icon: "color-red-11",
			},
			blue: {
				body: "border-blue-7 bg-blue-2 active:bg-blue-3",
				text: "text-blue-11",
				icon: "color-blue-11",
			},
			green: {
				body: "border-green-7 bg-green-2 active:bg-green-3",
				text: "text-green-11",
				icon: "color-green-11",
			},
			yellow: {
				body: "border-yellow-7 bg-yellow-2 active:bg-yellow-3",
				text: "text-yellow-11",
				icon: "color-yellow-11",
			},
			salmon: {
				body: "border-salmon-7 bg-salmon-2 active:bg-salmon-3",
				text: "text-salmon-11",
				icon: "color-salmon-11",
			},
			gray: {
				body: "border-slate-7 bg-slate-2 active:bg-slate-3",
				text: "text-slate-11",
				icon: "color-slate-11",
			},
		},
		disabled: {
			true: {
				body: "border-slate-7 bg-slate-3 active:border-slate-7 active:bg-slate-3",
				text: "text-slate-11",
				icon: "color-slate-11",
			},
		},
	},
});

export const lightColorVariants = tv({
	slots: {
		body: "",
		text: "",
		icon: "",
	},
	variants: {
		color: {
			red: {
				body: "bg-red-4 active:bg-red-5",
				text: "text-red-11",
				icon: "color-red-11",
			},
			blue: {
				body: "bg-blue-4 active:bg-blue-5",
				text: "text-blue-11",
				icon: "color-blue-11",
			},
			green: {
				body: "bg-green-4 active:bg-green-5",
				text: "text-green-11",
				icon: "color-green-11",
			},
			yellow: {
				body: "bg-yellow-4 active:bg-yellow-5",
				text: "text-yellow-11",
				icon: "color-yellow-11",
			},
			salmon: {
				body: "bg-salmon-4 active:bg-salmon-5",
				text: "text-salmon-11",
				icon: "color-salmon-11",
			},
			gray: {
				body: "bg-slate-4 active:bg-slate-5",
				text: "text-slate-11",
				icon: "color-slate-11",
			},
		},
		disabled: {
			true: {
				body: "bg-slate-4 active:bg-slate-4",
				text: "text-slate-11",
				icon: "color-slate-11",
			},
		},
	},
});

export const filledColorVariants = tv({
	slots: {
		body: "",
		text: "",
		icon: "",
	},
	variants: {
		color: {
			red: {
				body: "bg-red-9 active:bg-red-10",
				text: "text-white",
				icon: "color-white",
			},
			blue: {
				body: "bg-blue-9 active:bg-blue-10",
				text: "text-white",
				icon: "color-white",
			},
			green: {
				body: "bg-green-9 active:bg-green-10",
				text: "text-white",
				icon: "color-white",
			},
			yellow: {
				body: "bg-yellow-9 active:bg-yellow-10",
				text: "text-black",
				icon: "color-black",
			},
			salmon: {
				body: "bg-salmon-9 active:bg-salmon-10",
				text: "text-white",
				icon: "color-white",
			},
			gray: {
				body: "bg-slate-9 active:bg-slate-10",
				text: "text-white",
				icon: "color-white",
			},
		},
		disabled: {
			true: {
				body: "bg-slate-9 hover:bg-slate-9 active:bg-slate-9 active:brightness-100",
				text: "text-slate-2",
				icon: "color-slate-2",
			},
		},
	},
});

export const colorVariants = {
	outline: outlineColorVariants,
	light: lightColorVariants,
	filled: filledColorVariants,
} as const;
