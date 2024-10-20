import { tv } from "@mona-ca/tailwind-helpers";
import type { FC, ReactNode } from "react";
import { Text as RNText } from "react-native";

type Props = {
	level?: "1" | "2";
	children?: ReactNode;
	truncated?: boolean;
	className?: string;
	bold?: boolean;
};

const variants = tv({
	base: "font-bold text-slate-12",
	variants: {
		level: {
			"1": "font-bold text-4xl",
			"2": "font-bold text-2xl",
		},
		bold: {
			true: "font-extrabold",
		},
	},
});

const Heading: FC<Props> = ({ level = "1", children, truncated = false, className, bold, ...props }) => {
	const style = variants({
		level,
		bold,
		className,
	});

	return (
		<RNText {...(truncated ? { numberOfLines: 1, ellipsizeMode: "tail" } : {})} className={style} {...props}>
			{children}
		</RNText>
	);
};

export { Heading };
