import { twMerge } from "@mona-ca/tailwind-helpers";
import { type ElementRef, type FC, type ReactElement, type ReactNode, type Ref, forwardRef } from "react";
import { Pressable, Text } from "react-native";
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
	bodyClassName?: string;
	textClassName?: string;
	iconClassName?:
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

const Btn = <LP extends {}, RP extends {}>(
	{
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
		bodyClassName,
		textClassName,
		iconClassName,
		children,
		rightIconProps,
		leftIconProps,
		...props
	}: Props<LP, RP>,
	ref: Ref<ElementRef<typeof Pressable>>,
): ReactNode => {
	const LeftIcon = leftIcon as unknown as FC<{ className?: string }>;
	const RightIcon = rightIcon as unknown as FC<{ className?: string }>;

	const leftIconStyleOverride = typeof iconClassName === "object" ? iconClassName.left : iconClassName;

	const rightIconStyleOverride = typeof iconClassName === "object" ? iconClassName.right : iconClassName;

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
		disabled,
	});

	return (
		<Pressable
			className={twMerge(body(), bodyColor(), bodyClassName)}
			disabled={loading || disabled}
			ref={ref}
			{...props}
		>
			{LeftIcon && <LeftIcon className={twMerge(icon(), iconColor(), leftIconStyleOverride)} {...leftIconProps} />}
			<Text className={twMerge(text(), textColor(), textClassName)}>{children}</Text>
			{RightIcon && <RightIcon className={twMerge(icon(), iconColor(), rightIconStyleOverride)} {...rightIconProps} />}
			{!disabled && loading && <LoadingSpinner className={twMerge(spinner(), spinnerColor())} />}
		</Pressable>
	);
};

const Button = forwardRef(Btn) as <LP extends {}, RP extends {}>(
	props: Props<LP, RP> & { ref?: Ref<ElementRef<typeof Pressable>> },
) => ReactElement | null;

export { Button };
