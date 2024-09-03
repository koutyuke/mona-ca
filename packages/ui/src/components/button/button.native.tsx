import { twMerge } from "@mona-ca/tailwind-helpers";
import type { ElementType, FC, ReactNode } from "react";
import { Pressable, Text } from "react-native";
import type { PolymorphicProps } from "../../types";
import { LoadingSpinner } from "../loading-spinner/index.native";
import type { SupportColor, SupportSize, SupportVariant } from "./type";
import { filledColorVariants } from "./variants/filled-color.variant";
import { ghostColorVariants } from "./variants/ghost-color.variant";
import { lightColorVariants } from "./variants/light-color.variant";
import { outlineColorVariants } from "./variants/outline-color.variant";
import { styleVariants } from "./variants/style.native.variant";

type Variants = {
	size?: SupportSize;
	variant?: SupportVariant;
	color: SupportColor;
	elevated?: boolean;
	loading?: boolean;
	disabled?: boolean;
	fullWidth?: boolean;
	bold?: boolean;
	circle?: boolean;
};

type Props<LP extends {}, RP extends {}> = Variants & {
	bodyOverrideClassName?: string;
	textOverrideClassName?: string;
	iconOverrideClassName?:
		| string
		| {
				left?: string;
				right?: string;
		  };
	children: string;
	rightIcon?: FC<RP & { className?: string }>;
	leftIcon?: FC<LP & { className?: string }>;
	rightIconProps?: Omit<RP, "className">;
	leftIconProps?: Omit<LP, "className">;
};

const Button = <LP extends {}, RP extends {}, E extends ElementType = typeof Pressable>({
	as,
	size = "md",
	variant = "outline",
	color,
	elevated = false,
	loading = false,
	disabled = false,
	fullWidth = false,
	bold = false,
	circle = false,
	leftIcon,
	rightIcon,
	bodyOverrideClassName,
	textOverrideClassName,
	iconOverrideClassName,
	children,
	rightIconProps,
	leftIconProps,
	...props
}: PolymorphicProps<E, Props<LP, RP>>): ReactNode => {
	const LeftIcon = leftIcon as unknown as FC<{ className?: string }>;
	const RightIcon = rightIcon as unknown as FC<{ className?: string }>;
	const Component = as || Pressable;

	const leftIconStyleOverride =
		typeof iconOverrideClassName === "object" ? iconOverrideClassName.left : iconOverrideClassName;

	const rightIconStyleOverride =
		typeof iconOverrideClassName === "object" ? iconOverrideClassName.right : iconOverrideClassName;

	const colorVariant =
		variant === "outline"
			? outlineColorVariants
			: variant === "light"
				? lightColorVariants
				: variant === "filled"
					? filledColorVariants
					: variant === "ghost"
						? ghostColorVariants
						: (() => {
								throw new Error("Invalid variant");
							})();

	const { body, text, spinner, icon } = styleVariants({
		variant,
		size,
		elevated: elevated && !disabled && !loading,
		loading: !disabled && loading,
		disabled,
		fullWidth,
		bold,
		circle,
	});

	const {
		body: bodyColor,
		text: textColor,
		spinner: spinnerColor,
		icon: iconColor,
	} = colorVariant({
		color,
		loading,
		disabled,
	});

	return (
		<Component
			className={twMerge(body(), bodyColor(), bodyOverrideClassName)}
			disabled={loading || disabled}
			{...props}
		>
			{LeftIcon && <LeftIcon className={twMerge(icon(), iconColor(), leftIconStyleOverride)} {...leftIconProps} />}
			<Text className={twMerge(text(), textColor(), textOverrideClassName)}>{children}</Text>
			{RightIcon && <RightIcon className={twMerge(icon(), iconColor(), rightIconStyleOverride)} {...rightIconProps} />}
			{!disabled && loading && <LoadingSpinner className={twMerge(spinner(), spinnerColor())} />}
		</Component>
	);
};

export { Button };
