import { tv } from "@mona-ca/tailwind-helpers";
import { LoadingSpinner } from "@mona-ca/ui/native/components";
import { WhiteDiscordIcon } from "@mona-ca/ui/native/icons";
import { Pressable, Text, View } from "react-native";

import type { ComponentProps, FC } from "react";

type DiscordButtonProps = {
	fullWidth?: boolean;
	loading?: boolean;
	disabled?: boolean;
} & Omit<ComponentProps<typeof Pressable>, "disabled" | "className">;

const styleVariants = tv({
	slots: {
		body: "flex h-[3.125rem] flex-row items-center justify-center gap-2.5 self-start rounded-xl bg-discord px-3 transition active:bg-discord/90",
		text: "text-center font-bold text-[18px] text-white leading-[25px]",
		icon: "size-6 self-auto",
	},
	variants: {
		fullWidth: {
			true: {
				body: "w-full",
				text: "flex-1",
			},
		},
		disabled: {
			true: {
				body: "opacity-50",
			},
		},
		loading: {
			true: {
				body: "bg-discord",
				text: "opacity-0",
				icon: "opacity-0",
			},
		},
	},
});

const ContinueWithDiscordButton: FC<DiscordButtonProps> = ({
	fullWidth = false,
	loading = false,
	disabled = false,
	ref,
	...props
}) => {
	const { body, text, icon } = styleVariants({ fullWidth, disabled, loading });
	return (
		<Pressable className={body()} disabled={loading || disabled} ref={ref} {...props}>
			<WhiteDiscordIcon className={icon()} />
			<Text className={text()}>Discordで続ける</Text>
			{loading && (
				<View className="absolute">
					<LoadingSpinner color="white" size={24} />
				</View>
			)}
		</Pressable>
	);
};

export { ContinueWithDiscordButton };
