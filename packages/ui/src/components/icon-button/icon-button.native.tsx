import { cn } from "@mona-ca/tailwind-helpers";
import { Pressable, View } from "react-native";
import { LoadingSpinner } from "../loading-spinner/index.native";
import { colorVariants, styleVariants } from "./style.native.variant";

import type { FC, Ref } from "react";
import type { IconProps } from "../../icons/type";

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
	ref?: Ref<View>;
};

const IconButton: FC<Props> = ({
	size = "md",
	variant = "outline",
	color,
	loading = false,
	disabled = false,
	circle = false,
	className,
	icon: Icon,
	iconSize,
	ref,
}) => {
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
		<Pressable className={cn(bodyStyle(), bodyColor(), className)} disabled={loading || disabled} ref={ref}>
			<Icon className={cn(iconStyle(), iconColor())} size={iconSize ?? (size === "sm" ? 20 : 24)} />
			{loading && (
				<View className="absolute">
					<LoadingSpinner color="gray" size={size === "sm" ? 20 : 24} />
				</View>
			)}
		</Pressable>
	);
};

IconButton.displayName = "IconButton";

export { IconButton };
