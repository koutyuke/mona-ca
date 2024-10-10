import { twPseudo } from "@mona-ca/tailwind-helpers";
import { tv } from "@mona-ca/tailwind-helpers";
import { Text } from "@mona-ca/ui/native/components";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { Pressable } from "react-native";
import { DiscordIcon } from "../icon/index.native";

type DiscordButtonProps = {
	size?: "sm" | "md";
	children?: string;
	fullWidth?: boolean;
	disabled?: boolean;
} & Omit<ComponentPropsWithoutRef<typeof Pressable>, "disabled" | "className">;

const styleVariants = tv({
	slots: {
		body: twPseudo("group relative flex flex-row items-center justify-center gap-2 self-start bg-discord transition", {
			active: "bg-discord/90",
		}),
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
				body: "bg-slate-9 opacity-75",
			},
			false: {
				body: "opacity-100",
			},
		},
	},
});

const DiscordButton = forwardRef<typeof Pressable, DiscordButtonProps>(
	({ size = "md", children = "Discordで続ける", fullWidth = false, disabled = false, ...props }, ref) => {
		const { body, icon } = styleVariants({ size, fullWidth, disabled });
		return (
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			<Pressable ref={ref as any} className={body()} disabled={disabled} {...props}>
				<DiscordIcon className={icon()} color="white" />
				<Text className="self-auto font-bold text-white" size={size}>
					{children}
				</Text>
			</Pressable>
		);
	},
);

export { DiscordButton };
