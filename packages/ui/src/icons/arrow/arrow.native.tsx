import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react-native";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "../type";

type ArrowIconProps = IconProps<"up" | "down" | "left" | "right">;

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

const ArrowIcon: FC<ArrowIconProps> = ({ state = "left", size, ...otherProps }) => {
	const Icon =
		state === "up"
			? ArrowUp
			: state === "down"
				? ArrowDown
				: state === "left"
					? ArrowLeft
					: state === "right"
						? ArrowRight
						: (() => {
								throw new Error("Invalid state");
							})();

	return <Icon size={size ?? 0} {...otherProps} />;
};

export { ArrowIcon };
