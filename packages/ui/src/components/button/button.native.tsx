import { cn } from "@mona-ca/tailwind-helpers";
import type { FC, ReactNode, Ref } from "react";
import { Pressable, type PressableProps, View } from "react-native";
import type { IconProps } from "../../icons/index.native";
import { LoadingSpinner } from "../loading-spinner/index.native";
import { Text } from "../text/index.native";
import { colorVariants, styleVariants } from "./style.native";

type Props = Omit<PressableProps, "children"> & {
	size?: "sm" | "md";
	variant?: "outline" | "light" | "filled";
	color: "red" | "blue" | "green" | "yellow" | "salmon" | "gray";
	loading?: boolean;
	disabled?: boolean;
	circle?: boolean;
	textClassName?: string;
	icon?: FC<IconProps>;
	iconPosition?: "left" | "right";
	iconSize?: number;
	children: string;
	ref?: Ref<View>;
};

/**
 * The `Button` component is a versatile and customizable button element designed for use in React Native applications.
 * It can display text, icons, and loading indicators, and supports various configurations such as size, color, and icon position.
 * The button can also be disabled or set to a loading state, providing visual feedback to users.
 *
 * @param {"sm" | "md"} [props.size] - Determines the size of the button, affecting the text and icon dimensions.
 *
 * @param {"outline" | "light" | "filled"} [props.variant] - Specifies the variant of the button, affecting its appearance and behavior.
 * - `filled` - A primary button with a background color.
 * - `outline` - A secondary button with a border and a background color.
 * - `light` - A tertiary button with a background color and no border.
 *
 * @param {"red" | "blue" | "green" | "yellow" | "salmon" | "gray"} [props.color] - Specifies the color variant of the button, affecting its background and text color.
 *
 * @param {boolean} [props.loading] - Indicates whether the button is in a loading state, displaying a spinner if true.
 *
 * @param {boolean} [props.disabled] - Disables the button, preventing user interaction and applying a disabled style.
 *
 * @param {boolean} [props.circle] - If true, renders the button with a circular shape.
 *
 * @param {string} [props.textClassName] - Additional class names for custom styling of the button text.
 *
 * @param {FC<IconProps>} [props.icon] - An optional icon component to display on the button.
 *
 * @param {"left" | "right"} [props.iconPosition] - Determines the position of the icon, either "left" or "right".
 *
 * @param {number} [props.iconSize] - Specifies the size of the icon.
 *
 * @param {ReactNode} [props.children] - Specifies the content of the button.
 *
 * @param {string} [props.className] - Additional class names for custom styling of the button.
 *
 * @param {React.Ref<ElementRef<typeof Pressable>>} [props.ref] - A ref to the underlying Pressable element.
 *
 * @returns {JSX.Element} A button element with customizable features, suitable for various user interactions.
 */
const Button: FC<Props> = ({
	size = "md",
	variant = "outline",
	color,
	loading = false,
	disabled = false,
	circle = false,
	className,
	textClassName,
	icon: IconComp,
	iconPosition = "left",
	iconSize,
	children,
	ref,
	...props
}: Props): ReactNode => {
	const colorVariant = colorVariants[variant];

	const { body, text, icon } = styleVariants({
		variant,
		size,
		loading,
		disabled,
		circle,
		rightIcon: IconComp && iconPosition === "right",
		leftIcon: IconComp && iconPosition === "left",
	});

	const {
		body: bodyColor,
		text: textColor,
		icon: iconColor,
	} = colorVariant({
		color,
		disabled: disabled || loading,
	});

	const Icon = IconComp ? (
		<View
			className={cn(
				"flex items-center justify-center overflow-hidden",
				size === "sm" && "size-4",
				size === "md" && "size-6",
			)}
		>
			<IconComp className={cn(icon(), iconColor())} size={iconSize ?? (size === "sm" ? 20 : 24)} />
		</View>
	) : null;

	return (
		<Pressable className={cn(body(), bodyColor(), className)} disabled={loading || disabled} ref={ref} {...props}>
			{iconPosition === "left" && Icon}
			<Text
				size={size}
				className={cn(text(), textColor(), textClassName)}
				weight={size === "sm" ? "regular" : "medium"}
				truncated
			>
				{children}
			</Text>
			{iconPosition === "right" && Icon}
			{loading && (
				<View className="absolute">
					<LoadingSpinner size={size === "sm" ? 20 : 24} color="gray" />
				</View>
			)}
		</Pressable>
	);
};

export { Button };
