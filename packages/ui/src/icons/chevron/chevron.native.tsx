import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react-native";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "../type";

type ChevronIconProps = IconProps<"up" | "down" | "left" | "right">;

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

const ChevronIcon: FC<ChevronIconProps> = ({ state = "left", size, ...otherProps }) => {
	const Icon =
		state === "up"
			? ChevronUp
			: state === "down"
				? ChevronDown
				: state === "left"
					? ChevronLeft
					: state === "right"
						? ChevronRight
						: (() => {
								throw new Error("Invalid state");
							})();

	return <Icon size={size ?? 0} {...otherProps} />;
};

export { ChevronIcon };
