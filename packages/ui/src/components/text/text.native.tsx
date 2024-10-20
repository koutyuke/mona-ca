import { tv } from "@mona-ca/tailwind-helpers";
import type { FC, ReactNode } from "react";
import { Text as RNText } from "react-native";

type Props = {
	bold?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
	truncated?: boolean;
	children: ReactNode;
};

const variants = tv({
	base: "font-medium text-slate-12",
	variants: {
		size: {
			sm: "text-sm",
			md: "text-[17px] leading-6",
			lg: "text-xl",
		},
		bold: {
			true: "font-bold",
		},
	},
});

const Text: FC<Props> = ({ children, bold = false, size = "md", className, truncated = false, ...props }) => {
	const style = variants({
		size,
		bold,
		className,
	});

	return (
		<RNText {...(truncated ? { numberOfLines: 1, ellipsizeMode: "tail" } : {})} className={style} {...props}>
			{children}
		</RNText>
	);
};

export { Text };
