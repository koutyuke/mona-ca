import { tv } from "@mona-ca/tailwind-helpers";
import { type ElementRef, type ReactNode, type Ref, forwardRef } from "react";
import { Text as RNText, type TextProps } from "react-native";

type Props = Omit<TextProps, "children"> & {
	size?: "xl" | "lg" | "md" | "sm" | "xs" | "2xs";
	children?: ReactNode;
	truncated?: boolean;
	className?: string;
	weight?: "light" | "regular" | "medium";
};

const variants = tv({
	base: "text-slate-12",
	variants: {
		size: {
			xl: "text-[36px] leading-[44px]", // page title
			lg: "text-[24px] leading-[30px]", // section title
			md: "text-[18px] leading-[25px]", // base text
			sm: "text-[16px] leading-[22px]", // secondary text
			xs: "text-sm", // tertiary text, footnote, caption
			"2xs": "text-xs", // tab name
		},
		weight: {
			light: "font-kiwi-maru-light",
			regular: "font-kiwi-maru-regular",
			medium: "font-kiwi-maru-medium",
		},
	},
});

const Txt = (
	{ size = "md", weight = "regular", children, truncated = false, className, ...props }: Props,
	ref: Ref<ElementRef<typeof RNText>>,
): JSX.Element => {
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

/**
 * The `Text` component is used to display text with different levels and weights.
 *
 * @param {Props} props - Properties for the `Text` component.
 * @param {"xl" | "lg" | "md" | "sm" | "xs" | "2xs"} [props.level="md"] - Specifies the level of the text.
 * - `xl`: Large text for page titles
 * - `lg`: Text for section titles
 * - `md`: Base text
 * - `sm`: Secondary text
 * - `xs`: Tertiary text, footnotes, captions
 * - `2xs`: Tab names
 *
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
 * @returns {JSX.Element} - Returns the `Text` component.
 */
const Text = forwardRef<ElementRef<typeof RNText>, Props>(Txt);

Text.displayName = "Text";

export { Text };
