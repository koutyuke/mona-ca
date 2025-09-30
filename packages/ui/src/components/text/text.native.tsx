import { tv } from "@mona-ca/tailwind-helpers";
import type { ReactNode, Ref } from "react";
import { Text as RNText, type TextProps } from "react-native";

type Props = Omit<TextProps, "children"> & {
	size?: "xl" | "lg" | "md" | "sm" | "xs";
	children?: ReactNode;
	truncated?: boolean;
	className?: string;
	weight?: "light" | "regular" | "medium";
	ref?: Ref<RNText>;
};

const variants = tv({
	base: "text-slate-12",
	variants: {
		size: {
			xl: "text-[34px] leading-[42px]", // page title
			lg: "text-[22px] leading-[28px]", // section title
			md: "text-[17px] leading-[22px]", // base text
			sm: "text-[15px] leading-[19px]", // secondary text
			xs: "text-xs", // tab name
		},
		weight: {
			light: "font-kiwi-maru-light",
			regular: "font-kiwi-maru-regular",
			medium: "font-kiwi-maru-medium",
		},
	},
});

/**
 * The `Text` component is used to display text with different levels and weights.
 *
 * @param {Props} props - Properties for the `Text` component.
 * @param {"xl" | "lg" | "md" | "sm" | "xs"} [props.level="md"] - Specifies the level of the text. (17px)
 * - `xl`: Large text for page titles (34px)
 * - `lg`: Text for section titles (22px)
 * - `md`: Base text (17px)
 * - `sm`: Secondary text (15px)
 * - `xs`: Tab name (13px)
 * @param {"light" | "regular" | "medium"} [props.weight="regular"] - Specifies the weight of the text.
 * - `light`: Light font
 * - `regular`: Regular font
 * - `medium`: Medium font
 *
 * @param {ReactNode} [props.children] - Specifies the content of the text.
 *
 * @param {boolean} [props.truncated=false] - Specifies whether the text should be truncated.
 *
 * @param {string} [props.className] - Specifies a custom class name.
 *
 * @param {Ref<RNText>} [props.ref] - A ref to the underlying Text element.
 *
 * @returns {JSX.Element} - Returns the `Text` component.
 */
const Text = ({
	size = "md",
	weight = "regular",
	children,
	truncated = false,
	className,
	ref,
	...props
}: Props): ReactNode => {
	const style = variants({
		size,
		weight,
		class: className,
	});

	return (
		<RNText ref={ref} {...(truncated ? { numberOfLines: 1, ellipsizeMode: "tail" } : {})} className={style} {...props}>
			{children}
		</RNText>
	);
};

Text.displayName = "Text";

export { Text };
