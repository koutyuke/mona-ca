import { Eye, EyeOff } from "lucide-react-native";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "../type";

cssInterop(Eye, {
	className: {
		target: "style",
	},
});

cssInterop(EyeOff, {
	className: {
		target: "style",
	},
});

type EyeIconProps = IconProps<"on" | "off">;

const EyeIcon: FC<EyeIconProps> = ({ state, size, ...otherProps }) => {
	const Icon = state === "on" ? Eye : EyeOff;

	return <Icon size={size ?? 0} {...otherProps} />;
};

export { EyeIcon };
