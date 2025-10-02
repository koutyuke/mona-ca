import { cn, tv } from "@mona-ca/tailwind-helpers";
import { cssInterop } from "nativewind";
import { type FC, type ReactNode, type Ref, useImperativeHandle, useRef, useState } from "react";
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
			onPress={() => inputRef.current?.focus()}
			disabled={disabled}
			onBlur={() => {
				setFocused(false);
				inputRef.current?.blur();
			}}
		>
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
					<Pressable
						onPress={() => {
							setShowSecureText(!isShowSecureText);
						}}
						className={secureIconWrapperStyle()}
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
