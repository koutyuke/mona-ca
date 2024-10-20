import { twMerge } from "@mona-ca/tailwind-helpers";
import {
	type ElementRef,
	type ElementType,
	type FC,
	type ReactElement,
	type ReactNode,
	type Ref,
	forwardRef,
} from "react";
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

const _Button = <LP extends {}, RP extends {}, E extends ElementType = typeof Pressable>(
	{
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
		bodyClassName,
		textClassName,
		iconClassName,
		children,
		rightIconProps,
		leftIconProps,
		...props
	}: PolymorphicProps<E, Props<LP, RP>>,
	ref: Ref<ElementRef<E>>,
): ReactNode => {
	const LeftIcon = leftIcon as unknown as FC<{ className?: string }>;
	const RightIcon = rightIcon as unknown as FC<{ className?: string }>;
	const Component = as || Pressable;

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
		<Component
			className={twMerge(body(), bodyColor(), bodyClassName)}
			disabled={loading || disabled}
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			ref={ref as any}
			{...props}
		>
			{LeftIcon && <LeftIcon className={twMerge(icon(), iconColor(), leftIconStyleOverride)} {...leftIconProps} />}
			<Text className={twMerge(text(), textColor(), textClassName)}>{children}</Text>
			{RightIcon && <RightIcon className={twMerge(icon(), iconColor(), rightIconStyleOverride)} {...rightIconProps} />}
			{!disabled && loading && <LoadingSpinner className={twMerge(spinner(), spinnerColor())} />}
		</Component>
	);
};

const Button = forwardRef(_Button) as <LP extends {}, RP extends {}, E extends ElementType = typeof Pressable>(
	props: PolymorphicProps<E, Props<LP, RP>> & { ref?: Ref<ElementRef<E>> },
) => ReactElement | null;

export { Button };
