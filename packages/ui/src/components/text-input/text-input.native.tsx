import { tv } from "@mona-ca/tailwind-helpers";
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
	size?: "sm" | "md";
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
		inputBody: "flex w-full flex-row items-center border-[1.5px] border-slate-7 bg-slate-2 transition",
		input: "flex-1 text-slate-11",
		iconBody: "flex items-center justify-center",
		icon: "color-slate-9",
		separator: "h-[calc(200%_/_3)] w-[1.5px] rounded-full bg-slate-7",
	},
	variants: {
		size: {
			sm: {
				inputBody: "h-9 gap-1.5 rounded-lg px-2",
				input: "text-[14px]",
				icon: "size-5",
			},
			md: {
				inputBody: "h-12 rounded-xl",
				input: "mx-2 text-[17px]",
				iconBody: "h-full w-11",
				icon: "size-6",
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

type Props<P extends {}> = Omit<RNTextInputProps, "placeholder" | "readOnly" | "className"> &
	Variants & {
		label?: string;
		placeholder?: string;
		credentials?: boolean;
		readOnly?: boolean;
		icon?: FC<P & { className?: string }>;
		iconProps?: Omit<P, "className">;
	};

const TextInput = <P extends {}>({
	icon,
	label,
	placeholder,
	credentials,
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
		iconBody: iconBodyStyle,
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
		<View className={"flex flex-col gap-[2px]"}>
			{label && (
				<Text size={size} bold>
					{label}
				</Text>
			)}
			<TouchableWithoutFeedback onPress={handleFocus} disabled={disabled || readOnly}>
				<View className={inputBodyStyle()}>
					{Icon && (
						<>
							<View className={iconBodyStyle()}>
								<Icon className={iconStyle()} />
							</View>
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
					/>
					{(!!credentials || !!readOnly) && <View className={separatorStyle()} />}
					{readOnly && (
						<View className={iconBodyStyle()}>
							<PenIcon state="off" className={iconStyle({})} />
						</View>
					)}
					{!!credentials && !!readOnly && <View className={separatorStyle()} />}
					{credentials && (
						<Pressable onPress={handleShowSecureText} className={iconBodyStyle()}>
							<EyeIcon state={isShowSecureText ? "on" : "off"} className={iconStyle()} />
						</Pressable>
					)}
				</View>
			</TouchableWithoutFeedback>
		</View>
	);
};

export { TextInput };
