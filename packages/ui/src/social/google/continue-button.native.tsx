import { tv } from "@mona-ca/tailwind-helpers";
import { type ComponentPropsWithoutRef, type ElementRef, type Ref, forwardRef } from "react";
import { Pressable, Text, View } from "react-native";
import { LoadingSpinner } from "../../components/index.native";
import { GoogleIcon } from "./icon.native";

type GoogleButtonProps = {
	fullWidth?: boolean;
	loading?: boolean;
	disabled?: boolean;
} & Omit<ComponentPropsWithoutRef<typeof Pressable>, "disabled" | "className">;

const styleVariants = tv({
	slots: {
		body: "flex h-[3.125rem] flex-row items-center justify-center gap-2.5 self-start rounded-xl border-[1.5px] border-slate-7 bg-google px-3 transition active:border-slate-8 active:bg-[#E8E8EC]",
		text: "text-center font-bold text-[#1F1F1F] text-[18px] leading-[25px]",
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
				body: "bg-google",
				text: "opacity-0",
				icon: "opacity-0",
			},
		},
	},
});

const ContinueWithGoogleBtn = (
	{ fullWidth = false, loading = false, disabled = false, ...props }: GoogleButtonProps,
	ref: Ref<ElementRef<typeof Pressable>>,
) => {
	const { body, text, icon } = styleVariants({ fullWidth, disabled, loading });
	return (
		<Pressable ref={ref} className={body()} disabled={loading || disabled} {...props}>
			<GoogleIcon className={icon()} />
			<Text className={text()}>Googleで続ける</Text>
			{loading && (
				<View className="absolute">
					<LoadingSpinner size={24} color="black" />
				</View>
			)}
		</Pressable>
	);
};

const ContinueWithGoogleButton = forwardRef<ElementRef<typeof Pressable>, GoogleButtonProps>(ContinueWithGoogleBtn);

export { ContinueWithGoogleButton };
