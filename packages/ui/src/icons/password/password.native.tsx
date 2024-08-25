import { KeyRound } from "lucide-react-native";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "../type";

cssInterop(KeyRound, {
	className: {
		target: "style",
	},
});

const PasswordIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <KeyRound size={size ?? 0} {...otherProps} />;
};

export { PasswordIcon };
