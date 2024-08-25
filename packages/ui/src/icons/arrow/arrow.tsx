import { ArrowBigDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import type { FC } from "react";
import type { IconProps } from "../type";

type ArrowIconProps = {
	direction: "up" | "down" | "left" | "right";
} & IconProps;

const ArrowIcon: FC<ArrowIconProps> = ({ direction, ...otherProps }) => {
	const Icon =
		direction === "up" ? ArrowUp : direction === "down" ? ArrowBigDown : direction === "left" ? ArrowLeft : ArrowRight;

	return <Icon {...otherProps} />;
};

export { ArrowIcon };
