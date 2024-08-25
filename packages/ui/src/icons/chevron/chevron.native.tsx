import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react-native";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "../type";

type ChevronIconProps = {
	direction: "up" | "down" | "left" | "right";
} & IconProps;

cssInterop(ChevronDown, {
	className: {
		target: "style",
	},
});

cssInterop(ChevronLeft, {
	className: {
		target: "style",
	},
});

cssInterop(ChevronRight, {
	className: {
		target: "style",
	},
});

cssInterop(ChevronUp, {
	className: {
		target: "style",
	},
});

const ChevronIcon: FC<ChevronIconProps> = ({ direction, size, ...otherProps }) => {
	const Icon =
		direction === "up"
			? ChevronUp
			: direction === "down"
				? ChevronDown
				: direction === "left"
					? ChevronLeft
					: ChevronRight;

	return <Icon size={size ?? 0} {...otherProps} />;
};

export { ChevronIcon };
