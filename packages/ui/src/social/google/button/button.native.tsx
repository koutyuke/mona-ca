import { twPseudo } from "@mona-ca/tailwind-helpers";
import { tv } from "@mona-ca/tailwind-helpers";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { Pressable } from "react-native";
import { Text } from "../../../components/text/index.native";
import { GoogleIcon } from "../icon/index.native";

type GoogleButtonProps = {
	size?: "sm" | "md";
	children?: string;
	fullWidth?: boolean;
	disabled?: boolean;
} & Omit<ComponentPropsWithoutRef<typeof Pressable>, "disabled" | "className">;

const styleVariants = tv({
	slots: {
		body: twPseudo(
			"group relative flex flex-row items-center justify-center gap-2 self-start border-[1.5px] border-slate-7 bg-google transition",
			{
				active: "border-slate-8 bg-slate-2",
			},
		),
		icon: "self-auto",
	},
	variants: {
		size: {
			sm: {
				body: "h-9 gap-1 rounded-lg px-2.5",
				icon: "size-5",
			},
			md: {
				body: "h-[3.125rem] rounded-xl px-[0.9375rem]", // height: 50px
				icon: "size-6",
			},
		},
		fullWidth: {
			true: {
				body: "w-full",
			},
		},
		disabled: {
			true: {
				body: "bg-slate-3 opacity-60",
			},
			false: {
				body: "opacity-100",
			},
		},
	},
});

const GoogleButton = forwardRef<typeof Pressable, GoogleButtonProps>(
	({ size = "md", children = "Googleで続ける", fullWidth = false, disabled = false, ...props }, ref) => {
		const { body, icon } = styleVariants({ size, fullWidth, disabled });
		return (
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			<Pressable ref={ref as any} className={body()} disabled={disabled} {...props}>
				<GoogleIcon className={icon()} />
				<Text className="self-auto" bold size={size}>
					{children}
				</Text>
			</Pressable>
		);
	},
);

export { GoogleButton };
