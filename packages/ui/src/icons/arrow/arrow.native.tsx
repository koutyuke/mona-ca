import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react-native";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "../type";

type ArrowIconProps = {
	direction: "up" | "down" | "left" | "right";
} & IconProps;

cssInterop(ArrowDown, {
	className: {
		target: "style",
	},
});

cssInterop(ArrowLeft, {
	className: {
		target: "style",
	},
});

cssInterop(ArrowRight, {
	className: {
		target: "style",
	},
});

cssInterop(ArrowUp, {
	className: {
		target: "style",
	},
});

const ArrowIcon: FC<ArrowIconProps> = ({ direction, size, ...otherProps }) => {
	const Icon =
		direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : direction === "left" ? ArrowLeft : ArrowRight;

	return <Icon size={size ?? 0} {...otherProps} />;
};

export { ArrowIcon };
