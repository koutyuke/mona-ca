import DarkIcon from "@mona-ca/core/assets/brand/dark-icon.svg";
import LightIcon from "@mona-ca/core/assets/brand/light-icon.svg";
import { twMerge } from "@mona-ca/tailwind-helpers";
import { cssInterop } from "nativewind";
import type { FC } from "react";
import type { IconProps } from "../../icons/type";

cssInterop(LightIcon, {
	className: {
		target: "style",
	},
});

cssInterop(DarkIcon, {
	className: {
		target: "style",
	},
});

const MonaCaLightIcon: FC<IconProps> = ({ className, ...props }) => {
	return <LightIcon className={twMerge("aspect-square", className)} {...props} />;
};

const MonaCaDarkIcon: FC<IconProps> = ({ className, ...props }) => {
	return <DarkIcon className={twMerge("aspect-square", className)} {...props} />;
};

export { MonaCaLightIcon, MonaCaDarkIcon };
