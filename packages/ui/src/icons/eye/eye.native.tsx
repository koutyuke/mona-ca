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

type EyeIconProps = {
	visible: boolean;
} & IconProps;

const EyeIcon: FC<EyeIconProps> = ({ visible, size, ...otherProps }) => {
	const Icon = visible ? Eye : EyeOff;

	return <Icon size={size ?? 0} {...otherProps} />;
};

export { EyeIcon };
