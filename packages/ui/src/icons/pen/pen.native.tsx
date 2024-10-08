import { Pen, PenOff } from "lucide-react-native";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "../type";

cssInterop(Pen, {
	className: {
		target: "style",
	},
});

cssInterop(PenOff, {
	className: {
		target: "style",
	},
});

type PenIconProps = IconProps<"on" | "off">;

const PenIcon: FC<PenIconProps> = ({ state = "on", size, ...otherProps }) => {
	const Icon =
		state === "on"
			? Pen
			: state === "off"
				? PenOff
				: (() => {
						throw new Error("Invalid state");
					})();

	return <Icon size={size ?? 0} {...otherProps} />;
};

export { PenIcon };
