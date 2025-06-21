import { tv } from "@mona-ca/tailwind-helpers";
import { LoadingSpinner } from "@mona-ca/ui/native/components";
import { EmailIcon } from "@mona-ca/ui/native/icons";
import { type ComponentPropsWithoutRef, type ElementRef, type Ref, forwardRef } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
	fullWidth?: boolean;
	loading?: boolean;
	disabled?: boolean;
} & Omit<ComponentPropsWithoutRef<typeof Pressable>, "disabled" | "className">;

const styleVariants = tv({
	slots: {
		body: "flex h-[3.125rem] flex-row items-center justify-center gap-2.5 self-start rounded-xl border border-slate-7 bg-slate-1 px-3 transition active:border-slate-8 active:bg-slate-3/50",
		text: "text-center font-bold text-[18px] text-slate-12 leading-[25px]",
		icon: "size-6 self-auto text-slate-9",
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
				text: "opacity-0",
				icon: "opacity-0",
			},
		},
	},
});

const ContinueWithEmailBtn = (
	{ fullWidth = false, loading = false, disabled = false, ...props }: Props,
	ref: Ref<ElementRef<typeof Pressable>>,
) => {
	const { body, text, icon } = styleVariants({ fullWidth, disabled, loading });
	return (
		<Pressable ref={ref} className={body()} disabled={loading || disabled} {...props}>
			<EmailIcon className={icon()} />
			<Text className={text()}>メールアドレスで続ける</Text>
			{loading && (
				<View className="absolute">
					<LoadingSpinner size={24} color="black" />
				</View>
			)}
		</Pressable>
	);
};

const ContinueWithEmailButton = forwardRef<ElementRef<typeof Pressable>, Props>(ContinueWithEmailBtn);

export { ContinueWithEmailButton };
