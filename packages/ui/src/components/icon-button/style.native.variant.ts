import { tv } from "@mona-ca/tailwind-helpers";

export const styleVariants = tv({
	slots: {
		body: "group relative flex max-w-full flex-row items-center justify-center gap-1 self-start transition-colors",
		icon: "self-auto",
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
				body: "size-9 rounded-lg",
				icon: "size-5",
			},
			md: {
				body: "size-[3.125rem] rounded-xl",
				icon: "size-6",
			},
		},
		loading: {
			true: {
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
	},
});

export const filledColorVariants = tv({
	slots: {
		body: "",
		icon: "",
	},
	variants: {
		color: {
			red: {
				body: "bg-red-9 active:bg-red-10",
				icon: "text-white",
			},
			blue: {
				body: "bg-blue-9 active:bg-blue-10",
				icon: "text-white",
			},
			green: {
				body: "bg-green-9 active:bg-green-10",
				icon: "text-white",
			},
			yellow: {
				body: "bg-yellow-9 active:bg-yellow-10",
				icon: "text-black",
			},
			salmon: {
				body: "bg-salmon-9 active:bg-salmon-10",
				icon: "text-white",
			},
			gray: {
				body: "bg-slate-9 active:bg-slate-10",
				icon: "text-white",
			},
		},
		disabled: {
			true: {
				body: "bg-slate-9 hover:bg-slate-9 active:bg-slate-9 active:brightness-100",
				icon: "text-slate-2",
			},
		},
	},
});

export const outlineColorVariants = tv({
	slots: {
		body: "",
		icon: "",
	},
	variants: {
		color: {
			red: {
				body: "border-red-7 bg-red-2 active:bg-red-3",
				icon: "text-red-11",
			},
			blue: {
				body: "border-blue-7 bg-blue-2 active:bg-blue-3",
				icon: "text-blue-11",
			},
			green: {
				body: "border-green-7 bg-green-2 active:bg-green-3",
				icon: "text-green-11",
			},
			yellow: {
				body: "border-yellow-7 bg-yellow-2 active:bg-yellow-3",
				icon: "text-yellow-11",
			},
			salmon: {
				body: "border-salmon-7 bg-salmon-2 active:bg-salmon-3",
				icon: "text-salmon-11",
			},
			gray: {
				body: "border-slate-7 bg-slate-2 active:bg-slate-3",
				icon: "text-slate-11",
			},
		},
		disabled: {
			true: {
				body: "border-slate-7 bg-slate-3 active:border-slate-7 active:bg-slate-3",
				icon: "text-slate-11",
			},
		},
	},
});

export const lightColorVariants = tv({
	slots: {
		body: "",
		icon: "",
	},
	variants: {
		color: {
			red: {
				body: "bg-red-4 active:bg-red-5",
				icon: "text-red-11",
			},
			blue: {
				body: "bg-blue-4 active:bg-blue-5",
				icon: "text-blue-11",
			},
			green: {
				body: "bg-green-4 active:bg-green-5",
				icon: "text-green-11",
			},
			yellow: {
				body: "bg-yellow-4 active:bg-yellow-5",
				icon: "text-yellow-11",
			},
			salmon: {
				body: "bg-salmon-4 active:bg-salmon-5",
				icon: "text-salmon-11",
			},
			gray: {
				body: "bg-slate-4 active:bg-slate-5",
				icon: "text-slate-11",
			},
		},
		disabled: {
			true: {
				body: "bg-slate-4 active:bg-slate-4",
				icon: "text-slate-11",
			},
		},
	},
});

export const colorVariants = {
	outline: outlineColorVariants,
	light: lightColorVariants,
	filled: filledColorVariants,
} as const;
