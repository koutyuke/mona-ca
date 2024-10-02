import { tv, twMerge } from "@mona-ca/tailwind-helpers";
import type { ElementType, ReactNode } from "react";
import { Text as RNText } from "react-native";
import type { PolymorphicProps } from "../../types";

type Props = {
	level?: "1" | "2" | "3";
	children?: ReactNode;
	isTruncated?: boolean;
	className?: string;
	bold?: boolean;
};

const variants = tv({
	variants: {
		level: {
			"1": "font-bold text-4xl",
			"2": "font-bold text-3xl",
			"3": "font-bold text-2xl",
		},
		bold: {
			true: "font-extrabold",
		},
	},
});

const Heading = <E extends ElementType = typeof RNText>({
	as,
	level = "1",
	children,
	isTruncated = false,
	className,
	bold,
	...props
}: PolymorphicProps<E, Props>): ReactNode => {
	const Tag = as || RNText;
	const style = variants({
		level,
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

export { Heading };
