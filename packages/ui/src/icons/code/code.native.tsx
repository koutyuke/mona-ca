import { RectangleEllipsis } from "lucide-react-native";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "../type";

cssInterop(RectangleEllipsis, {
	className: {
		target: "style",
	},
});

const CodeIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <RectangleEllipsis size={size ?? 0} {...otherProps} />;
};

export { CodeIcon };
