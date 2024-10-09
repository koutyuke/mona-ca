import { tv, twMerge } from "@mona-ca/tailwind-helpers";
import type { ElementType, ReactNode } from "react";
import { Text as RNText } from "react-native";
import type { PolymorphicProps } from "../../types/polymorphic";

type Props = {
	bold?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
	truncated?: boolean;
};

const variants = tv({
	variants: {
		size: {
			sm: "text-sm",
			md: "text-[17px] leading-6",
			lg: "text-xl",
		},
		bold: {
			true: "font-bold",
			false: "font-medium",
		},
	},
});

const Text = <E extends ElementType = typeof RNText>({
	as,
	children,
	bold = false,
	size = "md",
	className,
	truncated = false,
	...props
}: PolymorphicProps<E, Props>): ReactNode => {
	const Tag = as || RNText;
	const style = variants({
		size,
		bold,
	});

	return (
		<Tag
			{...(truncated ? { numberOfLines: 1, ellipsizeMode: "tail" } : {})}
			className={twMerge(style, className)}
			{...props}
		>
			{children}
		</Tag>
	);
};

export { Text };
