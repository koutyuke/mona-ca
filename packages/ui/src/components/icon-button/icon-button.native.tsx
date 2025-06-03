import { cn } from "@mona-ca/tailwind-helpers";
import { type ElementRef, type FC, type Ref, forwardRef } from "react";
import { Pressable, View } from "react-native";
import type { IconProps } from "../../icons/type";
import { LoadingSpinner } from "../loading-spinner/index.native";
import { colorVariants, styleVariants } from "./style.native.variant";

type Props = {
	size?: "sm" | "md";
	variant?: "outline" | "light" | "filled";
	color: "red" | "blue" | "green" | "yellow" | "salmon" | "gray";
	loading?: boolean;
	disabled?: boolean;
	circle?: boolean;

	className?: string;
	icon: FC<IconProps>;
	iconSize?: number;
};

const IconBtn = (
	{
		size = "md",
		variant = "outline",
		color,
		loading = false,
		disabled = false,
		circle = false,
		className,
		icon: Icon,
		iconSize,
	}: Props,
	ref: Ref<ElementRef<typeof Pressable>>,
) => {
	const colorVariant = colorVariants[variant];

	const { body: bodyStyle, icon: iconStyle } = styleVariants({
		variant,
		size,
		loading,
		disabled,
		circle,
	});

	const { body: bodyColor, icon: iconColor } = colorVariant({
		color,
		disabled: disabled || loading,
	});

	return (
		<Pressable ref={ref} className={cn(bodyStyle(), bodyColor(), className)} disabled={loading || disabled}>
			<Icon className={cn(iconStyle(), iconColor())} size={iconSize ?? (size === "sm" ? 20 : 24)} />
			{loading && (
				<View className="absolute">
					<LoadingSpinner size={size === "sm" ? 20 : 24} color="gray" />
				</View>
			)}
		</Pressable>
	);
};

const IconButton = forwardRef<ElementRef<typeof Pressable>, Props>(IconBtn);

IconButton.displayName = "IconButton";

export { IconButton };
