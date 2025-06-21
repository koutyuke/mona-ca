import { cn, tv } from "@mona-ca/tailwind-helpers";
import { cssInterop } from "nativewind";
import { type FC, useRef, useState } from "react";
import {
	Pressable,
	TextInput as RNTextInput,
	type TextInputProps as RNTextInputProps,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { EyeCloseIcon, EyeIcon, type IconProps } from "../../icons/index.native";

cssInterop(RNTextInput, {
	className: { target: "style", nativeStyleToProp: { textAlign: true } },
	placeholderClassName: {
		target: false,
		nativeStyleToProp: {
			color: "placeholderTextColor",
		},
	},
});

const variants = tv({
	slots: {
		inputWrapper: "flex w-full flex-row items-center border border-slate-7 bg-slate-2 transition",
		input: "flex-1 font-kiwi-maru-regular text-slate-11",
		iconWrapper: "flex h-full items-center justify-center overflow-hidden",
	},
	variants: {
		size: {
			sm: {
				inputWrapper: "h-9 gap-1.5 rounded-lg px-2",
				input: "size-5 text-[16px] leading-[22px]",
				iconWrapper: "w-5",
			},
			md: {
				inputWrapper: "h-12 gap-2 rounded-xl px-3",
				input: "text-[18px] leading-[25px]",
				iconWrapper: "w-6",
			},
		},
		disabled: {
			true: {
				inputWrapper: "bg-slate-3 opacity-75",
				input: "text-slate-11",
			},
		},
		error: {
			true: {
				inputWrapper: "border-red-9",
			},
		},
		focused: {
			true: {
				inputWrapper: "border-blue-8",
			},
		},
	},
});

type Props = Omit<RNTextInputProps, "placeholder" | "readOnly" | "className"> & {
	size?: "sm" | "md";
	disabled?: boolean;
	error?: boolean;
	placeholder?: string;
	credentials?: boolean;
	icon?: FC<IconProps>;
	iconSize?: number;
};

const TextInput = ({
	icon: Icon,
	placeholder,
	credentials,
	size = "md",
	disabled,
	error,
	iconSize,
	...props
}: Props): JSX.Element => {
	const inputRef = useRef<RNTextInput>(null);
	const [isFocus, setFocused] = useState(false);
	const [isShowSecureText, setShowSecureText] = useState(true);

	const {
		inputWrapper: inputWrapperStyle,
		input: inputStyle,
		iconWrapper: iconWrapperStyle,
	} = variants({ size, focused: isFocus, disabled, error });

	const handleFocus = () => {
		inputRef.current?.focus();
		setFocused(true);
	};

	const handleShowSecureText = () => {
		setShowSecureText(!isShowSecureText);
	};

	return (
		<TouchableWithoutFeedback onPress={handleFocus} disabled={disabled}>
			<View className={inputWrapperStyle()}>
				{Icon && (
					<View className={iconWrapperStyle()}>
						<Icon className={cn("text-slate-9", error && "text-red-9")} size={(iconSize ?? size === "sm") ? 20 : 24} />
					</View>
				)}
				<RNTextInput
					ref={inputRef}
					className={inputStyle()}
					placeholder={placeholder}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					secureTextEntry={credentials && isShowSecureText}
					placeholderClassName="text-slate-9"
					editable={!disabled}
					{...props}
				/>
				{credentials && (
					<Pressable onPress={handleShowSecureText} className={iconWrapperStyle({ class: "h-full" })}>
						{isShowSecureText ? (
							<EyeCloseIcon
								className={cn("text-slate-9", error && "text-red-9")}
								size={(iconSize ?? size === "sm") ? 20 : 24}
							/>
						) : (
							<EyeIcon
								className={cn("text-slate-9", error && "text-red-9")}
								size={(iconSize ?? size === "sm") ? 20 : 24}
							/>
						)}
					</Pressable>
				)}
			</View>
		</TouchableWithoutFeedback>
	);
};

export { TextInput };
