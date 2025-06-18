import Icon from "@mona-ca/core/assets/social/google/icon.svg";
import { twMerge } from "@mona-ca/tailwind-helpers";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "../../icons/type";

cssInterop(Icon, {
	className: {
		target: "style",
	},
});

const GoogleIcon: FC<IconProps> = ({ className, ...props }) => {
	return <Icon className={twMerge("aspect-square", className)} {...props} />;
};

export { GoogleIcon };
