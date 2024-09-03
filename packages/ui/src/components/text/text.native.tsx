import { tv, twMerge } from "@mona-ca/tailwind-helpers";
import type { ElementType, ReactNode } from "react";
import { Text as RNText } from "react-native";
import type { PolymorphicProps } from "../../types/polymorphic";

type Props = {
	bold?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
	isTruncated?: boolean;
};

const variants = tv({
	variants: {
		size: {
			sm: "text-base",
			md: "text-lg",
			lg: "text-xl",
		},
		bold: {
			true: "font-bold",
		},
	},
});

const Text = <E extends ElementType = typeof RNText>({
	as,
	children,
	bold = false,
	size = "md",
	className,
	isTruncated = false,
	...props
}: PolymorphicProps<E, Props>): ReactNode => {
	const Tag = as || RNText;
	const style = variants({
		size,
		bold,
	});

	return (
		<Tag
			{...(isTruncated ? { numberOfLines: 1, ellipsizeMode: "tail" } : {})}
			className={twMerge(style, className)}
			{...props}
		>
			{children}
		</Tag>
	);
};

export { Text };
