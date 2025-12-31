import { cn, tv } from "@mona-ca/tailwind-helpers";
import { cssInterop } from "nativewind";
import { useImperativeHandle, useRef, useState } from "react";
import { Pressable, TextInput as RNTextInput, TouchableWithoutFeedback, View } from "react-native";
import { EyeCloseIcon, EyeIcon } from "../../icons/index.native";

import type { FC, ReactNode, Ref } from "react";
import type { TextInputProps as RNTextInputProps } from "react-native";
import type { IconProps } from "../../icons/index.native";

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
		inputWrapper: "flex w-full flex-row items-center overflow-hidden border border-slate-7 bg-slate-2 transition",
		input: "flex-1 font-kiwi-maru-regular text-slate-11",
		iconWrapper: "flex h-full items-center justify-center overflow-hidden",
		secureIconWrapper: "flex h-full items-center justify-center overflow-hidden",
	},
	variants: {
		size: {
			sm: {
				inputWrapper: "h-9 gap-1.5 rounded-lg pr-2 pl-2",
				input: "size-5 text-[15px] leading-[20px]",
				iconWrapper: "w-5",
				secureIconWrapper: "px-2",
			},
			md: {
				inputWrapper: "h-12 gap-2 rounded-xl pr-3 pl-3",
				input: "text-[17px] leading-[22.5px]",
				iconWrapper: "w-6",
				secureIconWrapper: "px-3",
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
		credentials: {
			true: {
				inputWrapper: "pr-0",
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
	ref?: Ref<RNTextInput>;
};

const TextInput: FC<Props> = ({
	icon: Icon,
	placeholder,
	credentials,
	size = "md",
	disabled,
	error,
	iconSize,
	ref,
	...props
}: Props): ReactNode => {
	const inputRef = useRef<RNTextInput>(null);
	const [isFocus, setFocused] = useState(false);
	const [isShowSecureText, setShowSecureText] = useState(true);

	const resolvedIconSize = iconSize !== undefined ? iconSize : size === "sm" ? 20 : 24;

	const {
		inputWrapper: inputWrapperStyle,
		input: inputStyle,
		iconWrapper: iconWrapperStyle,
		secureIconWrapper: secureIconWrapperStyle,
	} = variants({ size, focused: isFocus, disabled, error, credentials });

	useImperativeHandle(ref, () => inputRef.current!, []);

	return (
		<TouchableWithoutFeedback
			disabled={disabled}
			onBlur={() => {
				setFocused(false);
				inputRef.current?.blur();
			}}
			onPress={() => inputRef.current?.focus()}
		>
			<View className={inputWrapperStyle()}>
				{Icon && (
					<View className={iconWrapperStyle()}>
						<Icon className={cn("text-slate-9", error && "text-red-9")} size={(iconSize ?? size === "sm") ? 20 : 24} />
					</View>
				)}
				<RNTextInput
					className={inputStyle()}
					editable={!disabled}
					onBlur={() => setFocused(false)}
					onFocus={() => setFocused(true)}
					placeholder={placeholder}
					placeholderClassName="text-slate-9"
					ref={inputRef}
					secureTextEntry={credentials && isShowSecureText}
					{...props}
				/>
				{credentials && (
					<Pressable
						className={secureIconWrapperStyle()}
						onPress={() => {
							setShowSecureText(!isShowSecureText);
						}}
					>
						{isShowSecureText ? (
							<EyeIcon className={cn("text-slate-9", error && "text-red-9")} size={resolvedIconSize} />
						) : (
							<EyeCloseIcon className={cn("text-slate-9", error && "text-red-9")} size={resolvedIconSize} />
						)}
					</Pressable>
				)}
			</View>
		</TouchableWithoutFeedback>
	);
};

export { TextInput };
