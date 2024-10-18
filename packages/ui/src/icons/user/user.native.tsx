import { UserRound } from "lucide-react-native";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "../type";

cssInterop(UserRound, {
	className: {
		target: "style",
	},
});

type UserIconProps = IconProps;

const UserIcon: FC<UserIconProps> = ({ size, ...props }) => {
	return <UserRound size={size ?? 0} {...props} />;
};

export { UserIcon };
