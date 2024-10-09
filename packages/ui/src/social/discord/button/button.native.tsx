import { twPseudo } from "@mona-ca/tailwind-helpers";
import { tv } from "@mona-ca/tailwind-helpers";
import { Text } from "@mona-ca/ui/native/components";
import type { FC } from "react";
import { Pressable } from "react-native";
import { DiscordIcon } from "../icon/index.native";

type DiscordButtonProps = {
	size?: "sm" | "md";
	children?: string;
	fullWidth?: boolean;
	disabled?: boolean;
	onPress?: () => void;
};

const styleVariants = tv({
	slots: {
		body: twPseudo("group relative flex flex-row items-center justify-center gap-2 self-start bg-discord transition", {
			active: "bg-discord/90",
		}),
		text: "self-auto font-bold text-white",
		icon: "self-auto",
	},
	variants: {
		size: {
			sm: {
				body: "h-9 gap-1 rounded-lg px-2.5",
				text: "text-sm",
				icon: "size-5",
			},
			md: {
				body: "h-[3.125rem] rounded-xl px-[0.9375rem]", // height: 50px
				text: "text-[17px] leading-6",
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

const DiscordButton: FC<DiscordButtonProps> = ({
	size = "md",
	children = "Discordで続ける",
	fullWidth = false,
	onPress,
	disabled = false,
}) => {
	const { body, text, icon } = styleVariants({ size, fullWidth, disabled });
	return (
		<Pressable className={body()} onPress={onPress} disabled={disabled}>
			<DiscordIcon className={icon()} color="white" />
			<Text className={text()} size={size}>
				{children}
			</Text>
		</Pressable>
	);
};

export { DiscordButton };
