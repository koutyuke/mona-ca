import { twPseudo } from "@mona-ca/tailwind-helpers";
import { tv } from "@mona-ca/tailwind-helpers";
import type { FC } from "react";
import { Pressable } from "react-native";
import { Text } from "../../../components/text/index.native";
import { GoogleIcon } from "../icon/index.native";

type GoogleButtonProps = {
	size?: "sm" | "md";
	children?: string;
	fullWidth?: boolean;
	disabled?: boolean;
	onPress?: () => void;
};

const styleVariants = tv({
	slots: {
		body: twPseudo(
			"group relative flex flex-row items-center justify-center gap-2 self-start border border-slate-7 bg-google transition",
			{
				active: "border-slate-8 bg-slate-2",
			},
		),
		text: "self-auto font-bold text-slate-12",
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
				body: "bg-slate-3 opacity-60",
			},
			false: {
				body: "opacity-100",
			},
		},
	},
});

const GoogleButton: FC<GoogleButtonProps> = ({
	size = "md",
	children = "Googleで続ける",
	fullWidth = false,
	onPress,
	disabled = false,
}) => {
	const { body, text, icon } = styleVariants({ size, fullWidth, disabled });
	return (
		<Pressable className={body()} onPress={onPress} disabled={disabled}>
			<GoogleIcon className={icon()} />
			<Text className={text()}>{children}</Text>
		</Pressable>
	);
};

export { GoogleButton };
