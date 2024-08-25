import { Mail } from "lucide-react-native";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "../type";

cssInterop(Mail, {
	className: {
		target: "style",
	},
});

const EmailIcon: FC<IconProps> = ({ size, ...otherProps }) => {
	return <Mail size={size ?? 0} {...otherProps} />;
};

export { EmailIcon };
