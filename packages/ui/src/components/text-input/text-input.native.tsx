import { tv, twMerge } from "@mona-ca/tailwind-helpers";
import { cssInterop } from "nativewind";
import { type FC, useRef, useState } from "react";
import {
	Pressable,
	TextInput as RNTextInput,
	type TextInputProps as RNTextInputProps,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { EyeIcon, PenIcon } from "../../icons/index.native";
import { Text } from "../text/index.native";

type Variants = {
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	error?: boolean;
};

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
		inputBody: "flex w-full flex-row items-center border-[1.5px] border-slate-7 bg-slate-2 transition delay-0 ease-in",
		input: "flex-1 text-slate-11",
		icon: "color-slate-9",
		separator: "h-[calc(200%_/_3)] w-[1.5px] rounded-full bg-slate-7",
	},
	variants: {
		size: {
			sm: {
				inputBody: "h-9 gap-1.5 rounded-lg px-2",
				icon: "size-5",
				input: "text-[14px]",
			},
			md: {
				inputBody: "h-12 gap-2 rounded-xl px-3",
				icon: "size-6",
				input: "text-[17px]",
			},
			lg: {
				inputBody: "h-14 gap-2.5 rounded-[0.875rem] px-3.5",
				icon: "size-7",
				input: "text-[20px]",
			},
		},
		disabled: {
			true: {
				inputBody: "bg-slate-3",
			},
		},
		error: {
			true: {
				inputBody: "border-red-9",
			},
		},
		isFocused: {
			true: {
				inputBody: "border-blue-8",
			},
		},
	},
});

type Props<P extends {}> = Omit<RNTextInputProps, "placeholder" | "readOnly"> &
	Variants & {
		label?: string;
		placeholder?: string;
		credentials?: boolean;
		readOnly?: boolean;
		className?: string;
		icon?: FC<P & { className?: string }>;
		iconProps?: Omit<P, "className">;
	};

const TextInput = <P extends {}>({
	icon,
	label,
	placeholder,
	credentials,
	className,
	size = "md",
	disabled,
	readOnly,
	error,
	iconProps,
}: Props<P>): JSX.Element => {
	const Icon = icon as unknown as FC<{ className?: string }>;
	const inputRef = useRef<RNTextInput>(null);
	const [isFocused, setFocused] = useState(false);
	const [isShowSecureText, setShowSecureText] = useState(true);

	const {
		inputBody: inputBodyStyle,
		input: inputStyle,
		icon: iconStyle,
		separator: separatorStyle,
	} = variants({ size, isFocused, disabled, error });

	const handleFocus = () => {
		inputRef.current?.focus();
		setFocused(true);
	};

	const handleShowSecureText = () => {
		setShowSecureText(!isShowSecureText);
	};

	return (
		<View className={twMerge("flex flex-col gap-[2px]", className)}>
			{label && (
				<Text size={size} bold>
					{label}
				</Text>
			)}
			<TouchableWithoutFeedback onPress={handleFocus} disabled={disabled}>
				<View className={inputBodyStyle()}>
					{Icon && (
						<>
							<Icon className={iconStyle()} />
							<View className={separatorStyle()} {...iconProps} />
						</>
					)}
					<RNTextInput
						ref={inputRef}
						className={inputStyle()}
						placeholder={placeholder}
						onFocus={() => setFocused(true)}
						onBlur={() => setFocused(false)}
						secureTextEntry={credentials && isShowSecureText}
						placeholderClassName="text-slate-8"
						editable={!disabled && !readOnly}
						aria-disabled={disabled}
					/>
					{(!!credentials || !!readOnly) && <View className={separatorStyle()} />}
					{credentials && (
						<Pressable onPress={handleShowSecureText}>
							<EyeIcon state={isShowSecureText ? "on" : "off"} className={iconStyle()} />
						</Pressable>
					)}
					{readOnly && <PenIcon state="off" className={iconStyle()} />}
				</View>
			</TouchableWithoutFeedback>
		</View>
	);
};

export { TextInput };
