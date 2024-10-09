import { tv, twMerge } from "@mona-ca/tailwind-helpers";
import { type FC, useRef, useState } from "react";
import {
	Pressable,
	TextInput as RNTextInput,
	type TextInputProps as RNTextInputProps,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { EyeIcon, PenIcon } from "../../icons/index.native";

type Variants = {
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	error?: boolean;
};

const variants = tv({
	slots: {
		body: "flex flex-row items-center border-[1.5px] border-slate-7 bg-slate-2 transition delay-0",
		input: "flex-1 text-slate-11",
		icon: "color-slate-9",
		separator: "h-[calc(200%_/_3)] w-[1.5px] rounded-full bg-slate-7",
	},
	variants: {
		size: {
			sm: {
				body: "h-9 gap-1.5 rounded-lg px-2",
				icon: "size-5",
				input: "text-[14px]",
			},
			md: {
				body: "h-12 gap-2 rounded-xl px-3",
				icon: "size-6",
				input: "text-[17px]",
			},
			lg: {
				body: "h-14 gap-2.5 rounded-[0.875rem] px-3.5",
				icon: "size-7",
				input: "text-[20px]",
			},
		},
		disabled: {
			true: {
				body: "bg-slate-3",
			},
		},
		error: {
			true: {
				body: "border-red-9",
			},
		},
		isFocused: {
			true: {
				body: "border-blue-8",
			},
		},
	},
});

type Props<P extends {}> = Omit<RNTextInputProps, "placeholder" | "readOnly"> &
	Variants & {
		placeholder?: string;
		credentials?: boolean;
		readOnly?: boolean;
		overrideClassName?: string;
		icon?: FC<P & { className?: string }>;
		iconProps?: Omit<P, "className">;
	};

const TextInput = <P extends {}>({
	icon,
	placeholder,
	credentials,
	overrideClassName,
	size = "md",
	disabled,
	readOnly,
	error,
	iconProps,
}: Props<P>): JSX.Element => {
	const Icon = icon as unknown as FC<{ className?: string }>;
	const inputRef = useRef<RNTextInput>(null);
	const [isFocused, setIsFocused] = useState(false);
	const [isShowSecureText, setShowSecureText] = useState(true);

	const {
		body: bodyStyle,
		input: inputStyle,
		icon: iconStyle,
		separator: separatorStyle,
	} = variants({ size, isFocused, disabled, error });

	const handleFocus = () => {
		inputRef.current?.focus();
	};

	const handleShowSecureText = () => {
		setShowSecureText(!isShowSecureText);
	};

	return (
		<TouchableWithoutFeedback onPress={handleFocus} disabled={disabled}>
			<View className={twMerge(bodyStyle(), overrideClassName)}>
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
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
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
	);
};

export { TextInput };
