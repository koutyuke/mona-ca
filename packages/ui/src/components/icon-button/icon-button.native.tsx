import { twMerge } from "@mona-ca/tailwind-helpers";
import type { FC } from "react";
import { Pressable } from "react-native";
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
	loading?: boolean;
	disabled?: boolean;
	fullWidth?: boolean;
	circle?: boolean;
};

type Props<P extends {}> = Variants & {
	bodyOverrideClassName?: string;
	iconOverrideClassName?: string;
	icon: FC<P & { className?: string }>;
	iconProps?: Omit<P, "className">;
};

const IconButton = <P extends {}>({
	size = "md",
	variant = "outline",
	color,
	loading = false,
	disabled = false,
	fullWidth = false,
	circle = false,
	bodyOverrideClassName,
	iconOverrideClassName,
	icon,
	iconProps,
	...props
}: Props<P>) => {
	const Icon = icon as unknown as FC<{ className?: string }>;

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

	const {
		body: bodyStyle,
		spinner: spinnerStyle,
		icon: iconStyle,
	} = styleVariants({
		variant,
		size,
		loading: !disabled && loading,
		disabled,
		fullWidth,
		circle,
	});

	const {
		body: bodyColor,
		spinner: spinnerColor,
		icon: iconColor,
	} = colorVariant({
		color,
		disabled,
	});

	return (
		<Pressable
			className={twMerge(bodyStyle(), bodyColor(), bodyOverrideClassName)}
			disabled={loading || disabled}
			{...props}
		>
			<Icon className={twMerge(iconStyle(), iconColor(), iconOverrideClassName)} {...iconProps} />
			{!disabled && loading && <LoadingSpinner className={twMerge(spinnerStyle(), spinnerColor())} />}
		</Pressable>
	);
};

export { IconButton };
