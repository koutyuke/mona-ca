import { tv } from "@mona-ca/tailwind-helpers";
import { type ComponentPropsWithoutRef, type ElementRef, type Ref, forwardRef } from "react";
import { Pressable, Text, View } from "react-native";
import { LoadingSpinner } from "../../components/index.native";
import { WhiteDiscordIcon } from "./icon.native";

type DiscordButtonProps = {
	fullWidth?: boolean;
	loading?: boolean;
	disabled?: boolean;
} & Omit<ComponentPropsWithoutRef<typeof Pressable>, "disabled" | "className">;

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

const ContinueWithDiscordBtn = (
	{ fullWidth = false, loading = false, disabled = false, ...props }: DiscordButtonProps,
	ref: Ref<ElementRef<typeof Pressable>>,
) => {
	const { body, text, icon } = styleVariants({ fullWidth, disabled, loading });
	return (
		<Pressable ref={ref} className={body()} disabled={loading || disabled} {...props}>
			<WhiteDiscordIcon className={icon()} />
			<Text className={text()}>Discordで続ける</Text>
			{loading && (
				<View className="absolute">
					<LoadingSpinner size={24} color="white" />
				</View>
			)}
		</Pressable>
	);
};

const ContinueWithDiscordButton = forwardRef<ElementRef<typeof Pressable>, DiscordButtonProps>(ContinueWithDiscordBtn);

export { ContinueWithDiscordButton };
